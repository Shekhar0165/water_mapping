import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(UserRole.ADMIN)
    async findAll() {
        return this.usersService.findAll();
    }

    @Post()
    @Roles(UserRole.ADMIN)
    async createUser(@Body() body: any) {
        const { email, name, role, password } = body;
        if (!email || !name || !role || !password) {
            throw new BadRequestException('Missing required fields');
        }

        const existing = await this.usersService.findByEmail(email);
        if (existing) {
            throw new BadRequestException('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await this.usersService.create({
            email,
            name,
            role,
            password_hash
        });

        // Omit sensitive data before returning
        const { password_hash: _, hashedRefreshToken, ...result } = newUser;
        return result;
    }
}
