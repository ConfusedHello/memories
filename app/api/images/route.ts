import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const s3Client = new S3Client({
	region: 'auto',
	endpoint: process.env.R2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID!,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
});

export async function GET() {
	try {
		const allImages: {
			src: string;
			alt: string;
			key: string;
			size?: number;
		}[] = [];
		let continuationToken: string | undefined = undefined;

		// Fetch all objects (handles pagination automatically)
		do {
			const command = new ListObjectsV2Command({
				Bucket: process.env.R2_BUCKET_NAME,
				MaxKeys: 1000,
				...(continuationToken && { ContinuationToken: continuationToken }),
			});

			const response = await s3Client.send(command);

			const images =
				response.Contents?.filter((obj) => {
					const key = obj.Key?.toLowerCase() || '';
					return (
						key.endsWith('.jpg') ||
						key.endsWith('.jpeg') ||
						key.endsWith('.png') ||
						key.endsWith('.webp') ||
						key.endsWith('.gif')
					);
				}).map((obj) => ({
					src: `/api/images/${encodeURIComponent(obj.Key!)}`,
					alt: obj.Key || '',
					key: obj.Key!,
					size: obj.Size,
				})) || [];

			allImages.push(...images);
			continuationToken = response.NextContinuationToken;
		} while (continuationToken);

		return NextResponse.json({
			images: allImages,
			total: allImages.length,
		});
	} catch (error) {
		console.error('Error listing R2 objects:', error);
		return NextResponse.json(
			{ error: 'Failed to list images from storage' },
			{ status: 500 }
		);
	}
}
