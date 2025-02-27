import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from ".";



@Entity()
export class ProductImages{

    @PrimaryGeneratedColumn()
    id : number;


    @Column('text')
    url: string;
    
    @ManyToOne(
        () => Product,
        ( product ) => product.images,
       { onDelete : 'CASCADE'}
    )
    product: Product

}