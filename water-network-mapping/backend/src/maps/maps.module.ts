import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapsService } from './maps.service';
import { MapsController } from './maps.controller';
import { NetworkNode } from './entities/node.entity';
import { NetworkPipe } from './entities/pipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NetworkNode, NetworkPipe])],
  providers: [MapsService],
  controllers: [MapsController],
  exports: [MapsService],
})
export class MapsModule { }
