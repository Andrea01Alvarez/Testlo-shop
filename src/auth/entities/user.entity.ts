import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from '../../products/entities/product.entity';

@Entity('users')
export class User{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        comment: 'Campo donde se almacena el correo electronico del usuario',
        length: 80,
        unique:true
    })
    email:string;

    @Column('text', {
        select: false
    })
    password: string;
    
    @Column({
        type: 'varchar',
        comment: 'Campo donde se almacena el nombre completo del usuario',
        length: 100
    })
    fullName: string;


    @Column({
        type: 'bool',
        comment: 'Campo donde si el usuario esta habilitado o no',
        default: true
    })
    isActive: boolean;

    @Column({
        type: 'text',
        array: true,
        default: ['user']
    })
    roles:string[];

    @BeforeInsert()
    checkFielBeforeInsert(){
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFielBeforeUpdate(){
        this.checkFielBeforeInsert();
    }

    //Relación con la entidad de productps

    @OneToMany( () => Product, ( product) => product.user)
    product: Product; 
}