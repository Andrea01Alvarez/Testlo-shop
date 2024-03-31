import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { error } from 'console';

interface ConnectedClients{
    [id: string] : { 
        socket: Socket,
        user: User,
    }
}

@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository <User>
    ){}

  async registerClient ( client: Socket, userId: string){

    const user = await this.userRepository.findOneBy({ id: userId}); 

    if (!user) throw new error ('User not found'); 
    if (!user.isActive) throw new error ('User not active'); 

    this.checkUserConnection(user); 

        this.connectedClients[client.id] = {
            socket: client,
            user: user,
        }; 
    }

    removeClient( clientId: string){
      delete this.connectedClients[clientId]; 
    }


    getConnectedClients(): string[] {

        return Object.keys( this.connectedClients); 
    }

    getUserFullName( socketId: string){
        return this.connectedClients[socketId].user.fullName; 
    }

    //Para desconectar al usuario si hay duplicados 
    private checkUserConnection( user: User){

        for ( const clientId of Object.keys( this.connectedClients)){

            const connectClient = this.connectedClients[clientId];

            if ( connectClient.user.id === user.id){
                connectClient.socket.disconnect(); 
                break; 
            }

        }
    }
}
