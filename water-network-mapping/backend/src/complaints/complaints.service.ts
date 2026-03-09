import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint, ComplaintStatus } from './entities/complaint.entity';
import { User } from '../users/user.entity';
import { NetworkPipe } from '../maps/entities/pipe.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ComplaintsService {
    constructor(
        @InjectRepository(Complaint)
        private complaintsRepository: Repository<Complaint>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(NetworkPipe)
        private pipesRepository: Repository<NetworkPipe>,
        private mailService: MailService,
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

        // Store reporter email for public complaints
        if (createComplaintDto.reporter_email) {
            complaint.reporter_email = createComplaintDto.reporter_email;
        }

        if (userId) {
            const user = await this.usersRepository.findOne({ where: { id: userId } });
            if (user) {
                complaint.reporter = user;
                // If the reporter has a cityId, assign the complaint to that city.
                // Otherwise use the DTO's cityId (e.g. for super admins creating a complaint, or public complaints).
                complaint.cityId = user.cityId || createComplaintDto.cityId || null;
            }
        } else {
            // Unauthenticated public complaint - rely on DTO or near pipe mapping logic
            complaint.cityId = createComplaintDto.cityId || null;
        }

        if (createComplaintDto.nearest_pipe_id) {
            const pipe = await this.pipesRepository.findOne({ where: { id: createComplaintDto.nearest_pipe_id } });
            if (pipe) {
                complaint.nearest_pipe = pipe;
                // Inherit cityId from the nearest pipe if not already set
                if (!complaint.cityId && pipe.cityId) {
                    complaint.cityId = pipe.cityId;
                }
            }
        }

        return this.complaintsRepository.save(complaint);
    }

    async findAllComplaints(user: any): Promise<Complaint[]> {
        // Super Admins can see all complaints
        if (user.role === 'super_admin') {
            return this.complaintsRepository.find({
                relations: ['reporter', 'assigned_worker', 'nearest_pipe']
            });
        }

        // Planners and Workers can only see complaints in their city
        return this.complaintsRepository.find({
            where: { cityId: user.cityId },
            relations: ['reporter', 'assigned_worker', 'nearest_pipe']
        });
    }

    async findAssignedComplaints(workerId: string): Promise<Complaint[]> {
        return this.complaintsRepository.find({
            where: { assigned_worker: { id: workerId } },
            relations: ['reporter', 'assigned_worker', 'nearest_pipe'],
            order: { created_at: 'DESC' }
        });
    }

    async findOneComplaint(id: string): Promise<Complaint> {
        const complaint = await this.complaintsRepository.findOne({
            where: { id },
            relations: ['reporter', 'assigned_worker', 'nearest_pipe'],
        });

        if (!complaint) {
            throw new NotFoundException(`Complaint with ID ${id} not found`);
        }

        return complaint;
    }

    async updateStatus(id: string, status: ComplaintStatus, workerId?: string): Promise<Complaint> {
        const complaint = await this.complaintsRepository.findOne({
            where: { id },
            relations: ['reporter', 'assigned_worker'],
        });

        if (!complaint) {
            throw new NotFoundException(`Complaint with ID ${id} not found`);
        }

        complaint.status = status;

        if (workerId) {
            const worker = await this.usersRepository.findOne({ where: { id: workerId } });
            if (worker) {
                complaint.assigned_worker = worker;
                if (!complaint.assigned_at) {
                    complaint.assigned_at = new Date();
                }
                await this.mailService.sendWorkerAssignmentEmail(
                    worker.email,
                    worker.name,
                    complaint.id,
                    complaint.type,
                );
            }
        }

        // Set resolved_at when status becomes Resolved
        if (status === ComplaintStatus.RESOLVED && !complaint.resolved_at) {
            complaint.resolved_at = new Date();

            // Notify reporter via email
            const reporterEmail = complaint.reporter_email || complaint.reporter?.email;
            if (reporterEmail) {
                await this.mailService.sendReporterResolutionEmail(
                    reporterEmail,
                    complaint.id,
                    complaint.type,
                );
            }
        }

        return this.complaintsRepository.save(complaint);
    }

    async assignWorker(complaintId: string, workerId: string): Promise<Complaint> {
        const complaint = await this.complaintsRepository.findOne({
            where: { id: complaintId },
            relations: ['reporter', 'assigned_worker'],
        });

        if (!complaint) {
            throw new NotFoundException(`Complaint with ID ${complaintId} not found`);
        }

        const worker = await this.usersRepository.findOne({ where: { id: workerId } });
        if (!worker) {
            throw new NotFoundException(`Worker with ID ${workerId} not found`);
        }

        complaint.assigned_worker = worker;
        if (!complaint.assigned_at) {
            complaint.assigned_at = new Date();
        }

        const saved = await this.complaintsRepository.save(complaint);

        await this.mailService.sendWorkerAssignmentEmail(
            worker.email,
            worker.name,
            complaint.id,
            complaint.type,
        );

        return saved;
    }

    async resolveComplaint(complaintId: string, resolutionMediaUrl: string, workerId: string): Promise<Complaint> {
        const complaint = await this.complaintsRepository.findOne({
            where: { id: complaintId },
            relations: ['reporter', 'assigned_worker'],
        });

        if (!complaint) {
            throw new NotFoundException(`Complaint with ID ${complaintId} not found`);
        }

        // Set status to Resolved
        complaint.status = ComplaintStatus.RESOLVED;
        complaint.resolved_at = new Date();

        // Save resolution media URL if provided
        if (resolutionMediaUrl) {
            complaint.resolution_media_url = resolutionMediaUrl;
        }

        // If not already assigned, assign to the worker resolving it
        if (!complaint.assigned_worker) {
            const worker = await this.usersRepository.findOne({ where: { id: workerId } });
            if (worker) {
                complaint.assigned_worker = worker;
                if (!complaint.assigned_at) {
                    complaint.assigned_at = new Date();
                }
            }
        }

        const saved = await this.complaintsRepository.save(complaint);

        // Notify reporter via email
        const reporterEmail = complaint.reporter_email || complaint.reporter?.email;
        if (reporterEmail) {
            await this.mailService.sendReporterResolutionEmail(
                reporterEmail,
                complaint.id,
                complaint.type,
            );
        }

        return saved;
    }
}
