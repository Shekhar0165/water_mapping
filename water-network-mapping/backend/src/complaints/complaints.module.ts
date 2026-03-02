import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { Complaint } from './entities/complaint.entity';
import { User } from '../users/user.entity';
import { NetworkPipe } from '../maps/entities/pipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Complaint, User, NetworkPipe])],
  providers: [ComplaintsService],
  controllers: [ComplaintsController],
  exports: [ComplaintsService],
})
export class ComplaintsModule { }
