import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService{
    private S3Client : S3Client;
    private bucket: string
    private publicUrl: string

    constructor(private configService: ConfigService){
        this.bucket = this.configService.get<string>('storage.bucket')!;
        this.publicUrl = this.configService.get<string>('storage.publicUrl')!;

        this.S3Client = new S3Client({
            region: 'auto',
            endpoint: this.configService.get<string>('storage.endpoiny'),
            credentials: {
                accessKeyId: this.configService.get<string>('storage.accessKeyId')!,
                secretAccessKey: this.configService.get<string>('storage.secretAccessKey')!,
            }
        });
    }
    async upload( buffer: Buffer ,  folder: string):Promise<string>{
        const key = `${folder}/${randomUUID()}.webp`;

        await this.S3Client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: 'image/webp'
            }),
        );

        return `${this.publicUrl}/${key}`
    }

}

