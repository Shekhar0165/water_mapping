import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('s3')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) { }

    // Can be called by Citizens (no guard) or Field Workers (with guard, depending on route structure)
    // For now, making it public so citizens can upload proof of leaks
    @Post('presigned-url')
    async getPresignedUrl(@Body() body: { fileName: string; contentType: string }) {
        return this.s3Service.generatePresignedUrl(body.fileName, body.contentType);
    }
}
