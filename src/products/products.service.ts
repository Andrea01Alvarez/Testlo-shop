import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid';
import { ProductImages } from './entities/product-images.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
 
  private readonly logger = new Logger('ProductsService')



  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImages)
    private readonly productImageRepository: Repository<ProductImages>,

    private readonly dataSource: DataSource,

  ) {}



  async create(createProductDto: CreateProductDto, user:User) {
    
    try {

      const { images = [], ...productDetails} = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map ( image => this.productImageRepository.create({ url: image})),
        user, 
      });
      
      await this.productRepository.save( product );

      return product;
      
    } catch (error) {

      this.handleDBExceptions(error);
      
    }

  }
 

 async  findAll( paginationDto: PaginationDto) {

    const { limit = 10, offset = 0} = paginationDto;

    const product = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });

    return product.map( product => ({
      ...product,
      images: product.images.map( img => img.url)
    }))
  }

  async  findOne(term: string) {

    let product: Product;

    
    if( isUUID(term) )
  {
    product = await this.productRepository.findOneBy({ id: term });
  } else {
    
    const queryBuilder = this.productRepository.createQueryBuilder('prod');
   
    product = await queryBuilder
    .where('UPPER(title) =:title or slug =:slug', {
      title: term.toUpperCase(),
      slug: term.toLowerCase(),
    })
    .leftJoinAndSelect('prod.images', 'prodImage')
    .getOne();
  } 
  
  
    if (!product)
      throw new NotFoundException(`Product with id ${term} not found`);
      
      return product;
    
  
   
  }

  async findONePlain ( term: string){
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map ( image => image.url)
    }
  }


  async update( id: string, updateProductDto: UpdateProductDto, user:User ) {

    const {images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id, ...toUpdate });

    if ( !product ) throw new NotFoundException(`Product with id: ${ id } not found`);

    //create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    
    try {

      if (images){
         await queryRunner.manager.delete( ProductImages, {product: { id }})
         
         product.images = images.map( 
          image => this.productImageRepository.create({ url: image}))
      
        }

        product.user = user; 
        
        await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();


      return product;
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }

  }

  async remove(id: string) {
    
    const product = await this.findOne(id);

    await this.productRepository.remove(product);
  }


  private handleDBExceptions( error: any){

   
      if ( error.code === '23505')
         throw new BadRequestException(error.detail);

      this.logger.error(error);
      throw new InternalServerErrorException(error.detail);
  }


  //para eliminar todos los productos que estan en la base de datos
  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');
  
    try {
      return await query
      .delete()
      .where({})
      .execute()
    } catch (error)
    {
      this.handleDBExceptions(error);
    }
  
  
  }


}
