import { UUID } from "crypto";
import { Socket } from "socket.io";

export interface IClient {

    client: Socket
    sessionId: UUID // corrisponde all'id del modelllo ISession

}