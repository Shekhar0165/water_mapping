import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NetworkNode } from './node.entity';

export enum PipeMaterial {
    PVC = 'PVC',
    CAST_IRON = 'CastIron',
    CONCRETE = 'Concrete',
}

export enum PipeStatus {
    ACTIVE = 'Active',
    LEAKING = 'Leaking',
    CLOSED = 'Closed',
    MAINTENANCE = 'Maintenance',
}

@Entity('network_pipes')
export class NetworkPipe {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: PipeMaterial,
    })
    material: PipeMaterial;

    @Column({ type: 'int' })
    diameter_mm: number;

    @Column({
        type: 'enum',
        enum: PipeStatus,
        default: PipeStatus.ACTIVE,
    })
    status: PipeStatus;

    @Column({ type: 'varchar', nullable: true })
    cityId: string | null;

    @Column({ type: 'timestamp', nullable: true })
    maintenance_start_time: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    maintenance_end_time: Date | null;

    @ManyToOne(() => NetworkNode)
    @JoinColumn({ name: 'start_node_id' })
    start_node: NetworkNode;

    @ManyToOne(() => NetworkNode)
    @JoinColumn({ name: 'end_node_id' })
    end_node: NetworkNode;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'LineString',
        srid: 4326,
    })
    geometry: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
