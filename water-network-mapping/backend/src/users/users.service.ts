import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const newUser = this.usersRepository.create(userData);
        return this.usersRepository.save(newUser);
    }

    async findAll(): Promise<Omit<User, 'password_hash' | 'hashedRefreshToken'>[]> {
        const users = await this.usersRepository.find({
            select: ['id', 'name', 'email', 'role', 'cityId', 'created_at']
        });
        return users;
    }

    async findByCity(cityId: string): Promise<Omit<User, 'password_hash' | 'hashedRefreshToken'>[]> {
        const users = await this.usersRepository.find({
            where: { cityId },
            select: ['id', 'name', 'email', 'role', 'cityId', 'created_at']
        });
        return users;
    }

    async updateRefreshToken(id: string, hashedRefreshToken: string | null): Promise<void> {
        await this.usersRepository.update(id, { hashedRefreshToken });
    }

    async updateUser(id: string, data: { cityId?: string | null; role?: UserRole }): Promise<User | null> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) return null;
        if (data.cityId !== undefined) user.cityId = data.cityId;
        if (data.role !== undefined) user.role = data.role;
        return this.usersRepository.save(user);
    }

    async findWorkersByCity(cityId: string): Promise<Partial<User>[]> {
        return this.usersRepository.find({
            where: { cityId, role: UserRole.WORKER },
            select: ['id', 'name', 'email', 'role', 'cityId'],
        });
    }
}
