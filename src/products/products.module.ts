import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImages  } from './entities';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports:[
    TypeOrmModule.forFeature([Product, ProductImages]),
    AuthModule
  ],
  exports: [ProductsService,
  TypeOrmModule]
})
export class ProductsModule {}
