import { BadRequestException, Body, Controller, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserPostInputDto } from '../Models/input-dto/user-post.input.dto';
import { ConfirmRegistrationOutputDto } from '../Models/output-dto/confirm-registration.output.dto';
import { AuthService } from '../services/auth.service';
import { ConfirmOutputDto } from '../Models/output-dto/confirm.output.dto';
import { ConfigService } from '@nestjs/config';
import { JwtUtils } from '../services/jwt-utils';
import { UserService } from '../services/user.service';
import { SecurityUtils } from '../services/security-utils';
import { TotpConfiguration } from 'src/config/@types-config';

@Controller('auth')
export class AuthController {

    // Per il momento ignoro la security strategy implementando esclusivamente l'autenticazione basata sui cookie

    private readonly totpConfig: TotpConfiguration

    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
        private readonly jwtUtils: JwtUtils,
        private readonly userService: UserService,
        private readonly securityUtils: SecurityUtils,
    ) { 
        this.totpConfig = configService.get<TotpConfiguration>("TotpConfig")
    }

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

    @Post("/login")


}
