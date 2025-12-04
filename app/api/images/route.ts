import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { s3Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/s3';

const buildProxySrc = (key: string) =>
    `/api/images/proxy?${new URLSearchParams({ key }).toString()}`;

export async function GET() {
    try {
        const allImages: {
            src: string;
            originSrc: string;
            alt: string;
            key: string;
            size?: number;
        }[] = [];
        let continuationToken: string | undefined;

        // Fetch all objects (handles pagination automatically)
        do {
            const command = new ListObjectsV2Command({
                Bucket: R2_BUCKET_NAME,
                MaxKeys: 1000,
                ContinuationToken: continuationToken,
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
                }).map((obj) => {
                    const key = obj.Key || '';
                    return {
                        src: buildProxySrc(key),
                        originSrc: `${R2_PUBLIC_URL}/${key}`,
                        alt: key,
                        key,
                        size: obj.Size,
                    };
                }) || [];

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
