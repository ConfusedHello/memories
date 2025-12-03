import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

const s3Client = new S3Client({
	region: 'auto',
	endpoint: process.env.R2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID!,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
});

export async function GET(
	request: NextRequest,
	{ params }: { params: { key: string } }
) {
	try {
		const key = decodeURIComponent(params.key);

		const command = new GetObjectCommand({
			Bucket: process.env.R2_BUCKET_NAME,
			Key: key,
		});

		const response = await s3Client.send(command);

		if (!response.Body) {
			return NextResponse.json(
				{ error: 'Image not found' },
				{ status: 404 }
			);
		}

		// Convert the stream to a buffer
		const chunks: Uint8Array[] = [];
		const body = response.Body as ReadableStream;
		// @ts-expect-error - AWS SDK stream types are complex
		for await (const chunk of body) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);

		// Determine content type
		const contentType = response.ContentType || 'image/jpeg';

		// Return image with proper headers
		return new NextResponse(buffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000, immutable',
				'Access-Control-Allow-Origin': '*',
			},
		});
	} catch (error) {
		console.error('Error fetching image from R2:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch image' },
			{ status: 500 }
		);
	}
}

