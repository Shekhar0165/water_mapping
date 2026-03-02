import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { NetworkPipe } from '../../maps/entities/pipe.entity';

export enum ComplaintType {
    LEAK = 'Leak',
    NO_WATER = 'NoWater',
    LOW_PRESSURE = 'LowPressure',
    CONTAMINATION = 'Contamination',
}

export enum ComplaintStatus {
    OPEN = 'Open',
    IN_PROGRESS = 'InProgress',
    RESOLVED = 'Resolved',
}

@Entity('complaints')
export class Complaint {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reported_by' })
    reporter: User;

    @Column({
        type: 'enum',
        enum: ComplaintType,
    })
    type: ComplaintType;

    @Column({
        type: 'enum',
        enum: ComplaintStatus,
        default: ComplaintStatus.OPEN,
    })
    status: ComplaintStatus;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    geometry: string;

    @ManyToOne(() => NetworkPipe, { nullable: true })
    @JoinColumn({ name: 'nearest_pipe_id' })
    nearest_pipe: NetworkPipe;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'assigned_worker_id' })
    assigned_worker: User;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    media_url: string;

    @Column({ nullable: true })
    resolution_media_url: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
