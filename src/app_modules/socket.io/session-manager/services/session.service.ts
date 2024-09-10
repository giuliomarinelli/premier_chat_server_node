import { Injectable } from '@nestjs/common';
import { Session } from '../Models/mongo-db-schema/session.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@Injectable()
export class SessionService {

    constructor(@InjectModel(Session.name) private readonly catModel: Model<Session>) { }

}
