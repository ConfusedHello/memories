import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { s3Client, R2_BUCKET_NAME } from '@/lib/s3';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
        return new NextResponse('Missing key parameter', { status: 400 });
    }

    try {
        const command = new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
        });

        const response = await s3Client.send(command);

        if (!response.Body) {
            return new NextResponse('Image not found', { status: 404 });
        }

        // Convert the stream to a Web Response
        // @ts-expect-error - AWS SDK stream type mismatch with Web Response, but it works
        return new NextResponse(response.Body, {
            headers: {
                'Content-Type': response.ContentType || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        return new NextResponse('Failed to fetch image', { status: 500 });
    }
}
