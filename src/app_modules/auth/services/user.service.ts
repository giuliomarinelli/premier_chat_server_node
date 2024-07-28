import { UUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { SelectQuery } from 'src/query/query';
import { User } from '../Models/sql-entities/user.entity';
import { Optional } from 'src/optional/optional';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class UserService extends SelectQuery<User> {

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) {
        super()
    }

   

    // SELECT * FROM users u WHERE u.id = ? AND (u.is_enabled = true OR u.must_activate:into > ?)

    public async findValidUserById(id: UUID): Promise<Optional<User>> {

        const qb: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('u')
            .where('u.id = :id', { id })
            .andWhere(
                new Brackets(
                    qb => qb.where('u.isEnabled = true')
                        .orWhere('u.mustActivateInto > :now', { now: Date.now() })
                )) // da notare che i qb esterno e interno appartengono a scope indipendenti

        return await this.getOne(qb)

    }

    

    // SELECT * FROM users u WHERE u.id = ? AND u.is_enabled = false AND u.must_activate_into > ?

    public async findValidNotEnabledUserById(id: UUID): Promise<Optional<User>> {

        const qb: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('u')
            .where('u.id = :id', { id })
            .andWhere('u.isEnabled = false')
            .andWhere('u.mustActivateInto > :now', { now: Date.now() })

        return await this.getOne(qb)
        
    }

    // SELECT * FROM User u WHERE u.id = ? AND u.is_enabled = true

    public async findValidEnabledUserById(id: UUID): Promise<Optional<User>> {

        const qb: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('u')
            .where('u.id = :id', { id })
            .andWhere('u.isEnabled = true')

        return await this.getOne(qb)

    }

    // ==============================================================================================================
    // SELECT u FROM User u WHERE u.username = :username AND (u.enabled = true OR u.mustActivateInto > :now)

    public async findValidUserByUsername(username: UUID): Promise<Optional<User>> {

        const qb: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('u')
            .where('u.username = :username', { username }).andWhere(new Brackets(qb =>
                qb.where('u.isEnabled = true')
                    .orWhere('u.mustActivateInto > :now', { now: Date.now() })
            ))

        return await this.getOne(qb)

    }

    // SELECT u FROM User u WHERE u.username = :username AND u.enabled = false AND u.mustActivateInto > :now

    public async findValidNotEnabledUserByUsername(username: UUID): Promise<Optional<User>> {

        const qb: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('u')
            .where('u.username = :username', { username })
            .andWhere('u.isEnabled = false')
            .andWhere('u.mustActivateInto > :now', { now: Date.now() })


        return await this.getOne(qb)

    }

    // SELECT u FROM User u WHERE u.username = :username AND u.enabled = true

    public async findValidEnabledUserByUsername(username: UUID): Promise<Optional<User>> {

        const qb: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('u')
            .where('u.username = :username', { username })
            .andWhere('u.isEnabled = true')

        return await this.getOne(qb)

    }

    // ==============================================================================================================
    // SELECT u FROM User u WHERE u.email = :email AND (u.enabled = true OR u.mustActivateInto > :now)

    public async findValidUserByEmail(email: UUID): Promise<Optional<User>> {

        const qb: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('u')
            .where('u.email = :email', { email }).andWhere(new Brackets(qb =>
                qb.where('u.isEnabled = true')
                    .orWhere('u.mustActivateInto > :now', { now: Date.now() })
            ))

        return await this.getOne(qb)

    }

    // SELECT u FROM User u WHERE u.username = :username AND u.enabled = false AND u.mustActivateInto > :now

    public async findValidNotEnabledUserByEmail(email: UUID): Promise<Optional<User>> {

        const qb: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('u')
            .where('u.email = :email', { email })
            .andWhere('u.isEnabled = false')
            .andWhere('u.mustActivateInto > :now', { now: Date.now() })


        return await this.getOne(qb)

    }

    // SELECT u FROM User u WHERE u.username = :username AND u.enabled = true

    public async findValidEnabledUserByEmail(email: UUID): Promise<Optional<User>> {

        const qb: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('u')
            .where('u.email = :email', { email })
            .andWhere('u.isEnabled = true')

        return await this.getOne(qb)

    }

    // SELECT u.email FROM User u WHERE u.id = :userId AND u.enabled = true

    public async findEmailByUserId(userId: UUID): Promise<Optional<string>> {

        const qb: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('u')
            .select(["u.email"])
            .where('u.id = :userId', { userId })
            .andWhere('u.isEnabled = true')

        if ((await this.getOne(qb)).isEmpty()) return new Optional<string>()

        const { email } = (await this.getOne(qb)).get()

        return new Optional<string>(email)

    }

    // SELECT u.phoneNumber FROM User u WHERE u.id = :userId AND u.enabled = true

    public async findPhoneNumberByUserId(userId: UUID): Promise<Optional<string>> {

        const qb: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('u')
            .select(['u.phoneNumber'])
            .where('u.id = :userId', { userId })
            .andWhere('u.isEnabled = true')

        if ((await this.getOne(qb)).isEmpty()) return new Optional<string>()

        const { phoneNumber } = (await this.getOne(qb)).get()

        return new Optional<string>(phoneNumber)

    }

}
