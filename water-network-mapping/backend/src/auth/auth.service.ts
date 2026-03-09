import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password_hash))) {
            const { password_hash, hashedRefreshToken, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const tokens = await this.getTokens(user.id, user.email, user.role, user.cityId);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.hashedRefreshToken)
            throw new UnauthorizedException('Access Denied');

        const refreshTokenMatches = await bcrypt.compare(
            refreshToken,
            user.hashedRefreshToken,
        );
        if (!refreshTokenMatches) throw new UnauthorizedException('Access Denied');

        const tokens = await this.getTokens(user.id, user.email, user.role, user.cityId);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async logout(userId: string) {
        return this.usersService.updateRefreshToken(userId, null);
    }

    private async updateRefreshToken(userId: string, refreshToken: string) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(refreshToken, salt);
        await this.usersService.updateRefreshToken(userId, hash);
    }

    private async getTokens(userId: string, email: string, role: string, cityId: string | null) {
        const jwtPayload = { sub: userId, email, role, cityId };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET')!,
                expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') as any,
            }),
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') as any,
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    async hashData(data: string) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(data, salt);
    }
}
