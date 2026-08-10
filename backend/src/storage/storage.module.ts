import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ImageProcessorService } from './image-processor.service';

@Global()
@Module({
  providers: [StorageService , ImageProcessorService],
  exports: [StorageService ,  ImageProcessorService]
})
export class StorageModule {}
