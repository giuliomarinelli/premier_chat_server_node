import { BadRequestException, Body, Controller, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserPostInputDto } from '../Models/input-dto/user-post.input.dto';
import { ConfirmRegistrationOutputDto } from '../Models/output-dto/confirm-registration.output.dto';
import { AuthService } from '../services/auth.service';
import { ConfirmOutputDto } from '../Models/output-dto/confirm.output.dto';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) { }

    @Post("/register")
    @UsePipes(new ValidationPipe({ transform: true }))
    public async register(@Body() userDto: UserPostInputDto): Promise<ConfirmRegistrationOutputDto> {
        
        return await this.authService.register(userDto)
    
    }

    @Post("/activate-account")
    public async activateAccount(@Query("at") activationToken: string): Promise<ConfirmOutputDto> {

        if (!activationToken) throw new BadRequestException("'at' query param is required")
        return await this.authService.activateUser(activationToken)

    }

}
