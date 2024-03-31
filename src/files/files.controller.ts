import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
    ) {}

  @Get('product/:ImageName')
  findProductImage(
    @Res() res: Response,
    @Param('ImageName') imageName: string
  ){

    const path = this.filesService.getStaticProductImage(imageName);



   res.sendFile(path);
  }

 @Post('product')
 @UseInterceptors( FileInterceptor ('file', {
  fileFilter: fileFilter,
  //limits: {  fileSize: 1000  }

  //el storage es para decir donde lo quiero almacenar 
  storage: diskStorage({
    destination: './static/products',
    filename: fileNamer
  })
 })  )
 uploadProductImage(
   @UploadedFile() file: Express.Multer.File
  ){

    if( !file){
      throw new BadRequestException('Make sure that the file is an image');
    }


    const secureUrl =  ` ${ this.configService.get('HOST_API')}/files/product/${ file.filename}`; 
      return { secureUrl  };
 }
}
