import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImages } from './';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity( {name: 'products' })
export class Product {

    @ApiProperty(
        {
           example: '21bfeff2-be22-4684-84c6-5452a4381bfa',
           description: 'Product ID',
           uniqueItems: true
        }
    )
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty(
        {
            example: 'T-Shirt Teslo',
            description: 'Product Title',
            uniqueItems: true
         }
    )
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty(
        {
            example: '0',
            description: 'Product price'
         }
    )
    @Column('float',{
        default: 0
    })
    price: number;

    @ApiProperty(
        {
            example: 'Solo para tener mas descripcion',
            description: 'Product description',
            default: null
         }
    )
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty(
        {
            example: 't_shirt_teslo',
            description: 'Product SLUG - for SEO',
            uniqueItems: true
         }
    )
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty(
        {
            example: 10,
            description: 'Product stok',
            default: 0
         }
    )
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty(
         {
           example: ['M', 'XL', 'XXL'],
           description: 'Product sizes',
           default: 0
        }
    )
    @Column('text',{
        array: true,
        default: []
    })
    sizes: string[];

    @ApiProperty(
        {
            example: 'women',
            description: 'Product gender',
         }
    )
    @Column('text')
    gender: string;


    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    // images
    @ApiProperty()
    @OneToMany(
        () => ProductImages,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImages[];


    //Relacion con la entidad de usuarios
    @ManyToOne(
        () => User, (user) => user.product,
        { eager: true}
    )
    user: User; 

    @BeforeInsert()
    checkSlugInsert() {

        if ( !this.slug ) {
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')

    }

   @BeforeUpdate()
   checkSlugUpdate(){

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'",'')

   }

}