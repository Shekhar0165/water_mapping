import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { MapsModule } from './maps/maps.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { User } from './users/user.entity';
import { NetworkNode } from './maps/entities/node.entity';
import { NetworkPipe } from './maps/entities/pipe.entity';
import { Complaint } from './complaints/entities/complaint.entity';
import { AuthModule } from './auth/auth.module';
import { SocketsModule } from './sockets/sockets.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'mysecretpassword'),
        database: configService.get<string>('DB_NAME', 'water_network_db'),
        entities: [User, NetworkNode, NetworkPipe, Complaint],
        synchronize: true, // Use carefully in production! Works perfectly for simple dev setups.
      }),
    }),
    RedisModule,
    UsersModule,
    MapsModule,
    ComplaintsModule,
    AuthModule,
    SocketsModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
