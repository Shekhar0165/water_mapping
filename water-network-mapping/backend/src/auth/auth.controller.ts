import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard, JwtRefreshGuard } from './guards';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req: any) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    async refreshTokens(@Request() req: any) {
        return this.authService.refreshTokens(req.user.userId, req.headers.authorization.split(' ')[1]);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req: any) {
        return this.authService.logout(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
