import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../Models/sql-entities/user.entity';
import { Repository } from 'typeorm';
import { PasswordEncoder } from '../Models/interfaces/password-encoder.interface';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly encoder: PasswordEncoder,
        
    ) { }



}
