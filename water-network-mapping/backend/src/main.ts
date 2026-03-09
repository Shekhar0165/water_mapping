import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { UserRole } from './users/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend clients
  app.enableCors();

  const configService = app.get(ConfigService);
  const usersService = app.get(UsersService);
  const authService = app.get(AuthService);

  // --- Database Seeder for Initial Super Admin ---
  const adminEmail = configService.get<string>('INITIAL_ADMIN_EMAIL');
  const adminPassword = configService.get<string>('INITIAL_ADMIN_PASSWORD');

  if (adminEmail && adminPassword) {
    const existingAdmin = await usersService.findByEmail(adminEmail);
    if (!existingAdmin) {
      console.log('Seeding initial Super Admin account...');
      const hashedPassword = await authService.hashData(adminPassword);
      await usersService.create({
        name: 'Super Admin',
        email: adminEmail,
        password_hash: hashedPassword,
        role: UserRole.SUPER_ADMIN,
      });
      console.log('Super Admin account created successfully.');
    }
  }

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on http://0.0.0.0:${port}`);
}
bootstrap();
