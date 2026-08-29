import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import type { LoginResponse, RegisterRequest } from '@akuntask/shared';

class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
}

class RegisterDto {
  @IsString() companyName!: string;
  @IsString() companyNpwp?: string;
  @IsString() companyAddress?: string;
  @IsString() companyPhone?: string;
  @IsString() companyEmail?: string;
  @IsEmail() userEmail!: string;
  @IsString() @MinLength(8) userPassword!: string;
  @IsString() userName!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto): Promise<LoginResponse> {
    return this.auth.register({
      company: {
        name: body.companyName,
        npwp: body.companyNpwp,
        address: body.companyAddress,
        phone: body.companyPhone,
        email: body.companyEmail,
      },
      user: { email: body.userEmail, password: body.userPassword, name: body.userName },
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto): Promise<LoginResponse> {
    return this.auth.login(body.email, body.password);
  }
}
