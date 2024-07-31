import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ transports: ['websocket'] })
export class WsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    private server: Server

    public afterInit(server: Server) {
        console.log(server)
    }

    public handleConnection(client: Socket, ...args: any[]) {
        console.log(client.id, args)
    }

    public handleDisconnect(client: Socket) {
        console.log(client.id)
    }

}