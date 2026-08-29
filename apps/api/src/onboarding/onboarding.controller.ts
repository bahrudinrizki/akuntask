import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { OnboardingService } from './onboarding.service';
import type { AuthUser, CompanyDto, CompleteOnboardingResponse, OnboardingProfileRequest, OnboardingTemplateRequest, OnboardingWarehouseRequest, CoaTemplateKey } from '@akuntask/shared';

class ProfileDto implements OnboardingProfileRequest {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() npwp?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() industry?: string;
}

class TemplateDto implements OnboardingTemplateRequest {
  @IsIn(['PSAK_FULL', 'RETAIL', 'SERVICE']) template!: CoaTemplateKey;
}

class WarehouseDto implements OnboardingWarehouseRequest {
  @IsString() name!: string;
  @IsOptional() @IsString() location?: string;
}

@Controller('onboarding')
@UseGuards(AuthGuard('jwt'))
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Get()
  status(@Req() req: { user: AuthUser }): Promise<CompanyDto> {
    return this.onboarding.getCompany(req.user.companyId);
  }

  @Post('profile')
  profile(@Body() body: ProfileDto, @Req() req: { user: AuthUser }): Promise<CompanyDto> {
    return this.onboarding.updateProfile(req.user.companyId, body);
  }

  @Post('template')
  template(@Body() body: TemplateDto, @Req() req: { user: AuthUser }): Promise<CompanyDto> {
    return this.onboarding.applyTemplate(req.user.companyId, body);
  }

  @Post('warehouse')
  warehouse(@Body() body: WarehouseDto, @Req() req: { user: AuthUser }): Promise<CompanyDto> {
    return this.onboarding.addWarehouse(req.user.companyId, body);
  }

  @Post('complete')
  complete(@Req() req: { user: AuthUser }): Promise<CompleteOnboardingResponse> {
    return this.onboarding.complete(req.user.companyId);
  }
}
