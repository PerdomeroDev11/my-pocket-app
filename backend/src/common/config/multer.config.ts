import { BadRequestException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

const ALLOWED_MIME_TYPES = ['image/jpeg' , 'image/png' , 'image/webp']

export const imageUploadOptions: MulterOptions = {
    limits: {fileSize: 10 * 24 * 1024}, 
    fileFilter: (req , file , callback)=>{
        if(ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return callback(new BadRequestException('unsupported image format'),false)
        }
        callback(null, true)
    }
}