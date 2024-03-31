import { BadRequestException, Injectable} from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';


@Injectable()
export class FilesService {

    getStaticProductImage( imageName: string){
        const patch = join( __dirname, '../../static/products', imageName);

        if( !existsSync)
        throw new BadRequestException( `No product found with image ${ imageName}`);
        
        return patch;
    }
 

}
