import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NodeType {
    TANK = 'Tank',
    PUMP = 'Pump',
    VALVE = 'ShutoffValve',
    JUNCTION = 'Junction',
}

export enum NodeStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    MAINTENANCE = 'Maintenance',
}

@Entity('network_nodes')
export class NetworkNode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: NodeType,
        default: NodeType.JUNCTION,
    })
    type: NodeType;

    @Column({ nullable: true })
    name: string;

    @Column({
        type: 'enum',
        enum: NodeStatus,
        default: NodeStatus.ACTIVE,
    })
    status: NodeStatus;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    geometry: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
