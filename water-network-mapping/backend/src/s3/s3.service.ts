import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME')!;
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
            },
        });
    }

    // Generates a URL that a mobile app or browser can use to upload directly to S3
    // bypassing our server entirely for the heavy lifting.
    async generatePresignedUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> {
        try {
            const fileExtension = fileName.split('.').pop();
            const randomKey = `${uuidv4()}.${fileExtension}`;

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: randomKey,
                ContentType: contentType,
            });

            // URL expires in 15 minutes
            const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });

            return {
                uploadUrl,
                fileKey: randomKey, // Store this key in your Complaints database table
            };
        } catch (error) {
            throw new InternalServerErrorException('Could not generate presigned S3 url');
        }
    }
}
