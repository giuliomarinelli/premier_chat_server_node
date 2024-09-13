import { UUID } from "crypto";
import { IClient } from "./client.interface";

export interface IClientMap {

    userId: UUID
    clients: IClient[]

}