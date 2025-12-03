import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

const s3Client = new S3Client({
	region: 'auto',
	endpoint: process.env.R2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID!,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
});

const allowedOrigin =
	process.env.CORS_ALLOWED_ORIGIN || process.env.NEXT_PUBLIC_APP_URL || '*';

const corsHeaders = {
	'Access-Control-Allow-Origin': allowedOrigin,
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

const buildResponseHeaders = (contentType?: string, contentLength?: number) => {
	const headers = new Headers({
		...corsHeaders,
		'Cache-Control':
			'public, max-age=0, s-maxage=86400, stale-while-revalidate=43200',
		'Content-Type': contentType || 'application/octet-stream',
	});

	if (typeof contentLength === 'number') {
		headers.set('Content-Length', contentLength.toString());
	}

	return headers;
};

export function OPTIONS() {
	return new NextResponse(null, {
		status: 204,
		headers: corsHeaders,
	});
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const keyParam = searchParams.get('key');

	if (!keyParam) {
		return NextResponse.json(
			{ error: 'Missing "key" query parameter' },
			{ status: 400, headers: corsHeaders }
		);
	}

	const key = decodeURIComponent(keyParam);

	try {
		const command = new GetObjectCommand({
			Bucket: process.env.R2_BUCKET_NAME,
			Key: key,
		});

		const response = await s3Client.send(command);

		if (!response.Body) {
			throw new Error('Object body is empty');
		}

		let bodyStream: ReadableStream<Uint8Array> | undefined;

		if (response.Body instanceof Readable) {
			bodyStream = Readable.toWeb(response.Body) as ReadableStream<Uint8Array>;
		} else if (response.Body instanceof Blob) {
			bodyStream = response.Body.stream();
		} else {
			bodyStream = response.Body as ReadableStream<Uint8Array>;
		}

		const headers = buildResponseHeaders(
			response.ContentType,
			response.ContentLength
		);

		if (response.LastModified) {
			headers.set('Last-Modified', response.LastModified.toUTCString());
		}

		return new NextResponse(bodyStream, { status: 200, headers });
	} catch (error) {
		console.error('Error proxying image from R2:', error);

		const status = (error as { $metadata?: { httpStatusCode?: number } })
			?.$metadata?.httpStatusCode;

		const resolvedStatus = status === 404 ? 404 : 500;

		return NextResponse.json(
			{ error: resolvedStatus === 404 ? 'Image not found' : 'Failed to fetch image' },
			{ status: resolvedStatus, headers: corsHeaders }
		);
	}
}
