import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint, ComplaintStatus } from './entities/complaint.entity';
import { User } from '../users/user.entity';
import { NetworkPipe } from '../maps/entities/pipe.entity';

@Injectable()
export class ComplaintsService {
    constructor(
        @InjectRepository(Complaint)
        private complaintsRepository: Repository<Complaint>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(NetworkPipe)
        private pipesRepository: Repository<NetworkPipe>,
    ) { }

    async createComplaint(createComplaintDto: any, userId?: string): Promise<Complaint> {
        const { latitude, longitude, ...data } = createComplaintDto;

        const geometry = {
            type: 'Point',
            coordinates: [longitude, latitude],
        };

        const complaint = this.complaintsRepository.create({
            ...data,
            geometry,
        } as Partial<Complaint>);

        if (userId) {
            const user = await this.usersRepository.findOne({ where: { id: userId } });
            if (user) {
                complaint.reporter = user;
            }
        }

        if (createComplaintDto.nearest_pipe_id) {
            const pipe = await this.pipesRepository.findOne({ where: { id: createComplaintDto.nearest_pipe_id } });
            if (pipe) {
                complaint.nearest_pipe = pipe;
            }
        }

        return this.complaintsRepository.save(complaint);
    }

    async findAllComplaints(): Promise<Complaint[]> {
        return this.complaintsRepository.find({
            relations: ['reporter', 'assigned_worker', 'nearest_pipe']
        });
    }

    async updateStatus(id: string, status: ComplaintStatus, workerId?: string): Promise<Complaint> {
        const complaint = await this.complaintsRepository.findOne({ where: { id } });

        if (!complaint) {
            throw new NotFoundException(`Complaint with ID ${id} not found`);
        }

        complaint.status = status;

        if (workerId) {
            const worker = await this.usersRepository.findOne({ where: { id: workerId } });
            if (worker) {
                complaint.assigned_worker = worker;
            }
        }

        return this.complaintsRepository.save(complaint);
    }
}
