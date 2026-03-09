import { Controller, Get, Post, Patch, Body, Param, UseGuards, BadRequestException, NotFoundException, Request } from '@nestjs/common';
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
    @Roles(UserRole.SUPER_ADMIN, UserRole.CITY_PLANNER)
    async findAll(@Request() req: any) {
        // Super admin sees all users, city planner sees only their city's users
        if (req.user.role === UserRole.SUPER_ADMIN) {
            return this.usersService.findAll();
        }
        // City planner: return only users in their city
        if (req.user.cityId) {
            return this.usersService.findByCity(req.user.cityId);
        }
        return [];
    }

    @Get('workers/:cityId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.CITY_PLANNER)
    async findWorkersByCity(@Param('cityId') cityId: string) {
        return this.usersService.findWorkersByCity(cityId);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.CITY_PLANNER)
    async createUser(@Body() body: any, @Request() req: any) {
        const { email, name, role, password, cityId } = body;
        if (!email || !name || !password) {
            throw new BadRequestException('Missing required fields');
        }

        // City planner can only create workers in their own city
        let assignedRole = role;
        let assignedCityId = cityId || null;

        if (req.user.role === UserRole.CITY_PLANNER) {
            assignedRole = UserRole.WORKER;
            assignedCityId = req.user.cityId;
            if (!assignedCityId) {
                throw new BadRequestException('Your account has no city assigned. Cannot create workers.');
            }
        } else {
            // Super admin: role is required
            if (!role) {
                throw new BadRequestException('Missing required fields');
            }
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
            role: assignedRole,
            password_hash,
            cityId: assignedCityId,
        });

        // Omit sensitive data before returning
        const { password_hash: _, hashedRefreshToken, ...result } = newUser;
        return result;
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN)
    async updateUser(@Param('id') id: string, @Body() body: any) {
        const { cityId, role } = body;
        const updated = await this.usersService.updateUser(id, {
            ...(cityId !== undefined ? { cityId } : {}),
            ...(role !== undefined ? { role } : {}),
        });
        if (!updated) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        const { password_hash: _, hashedRefreshToken, ...result } = updated;
        return result;
    }
}
