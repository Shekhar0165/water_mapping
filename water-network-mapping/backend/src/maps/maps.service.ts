import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetworkNode } from './entities/node.entity';
import { NetworkPipe } from './entities/pipe.entity';
import { UserRole } from '../users/user.entity';

@Injectable()
export class MapsService {
    constructor(
        @InjectRepository(NetworkNode)
        private nodesRepository: Repository<NetworkNode>,
        @InjectRepository(NetworkPipe)
        private pipesRepository: Repository<NetworkPipe>,
    ) { }

    async createNode(createNodeDto: any, user: any): Promise<NetworkNode> {
        let geometry = null;
        if (createNodeDto.latitude !== undefined && createNodeDto.longitude !== undefined) {
            geometry = {
                type: 'Point',
                coordinates: [createNodeDto.longitude, createNodeDto.latitude]
            };
        }

        const cityId = user.role === UserRole.SUPER_ADMIN ? (createNodeDto.cityId || null) : user.cityId;

        const node = this.nodesRepository.create({
            ...createNodeDto,
            cityId,
            geometry,
        } as Partial<NetworkNode>);
        return this.nodesRepository.save(node);
    }

    async findAllNodes(user: any): Promise<NetworkNode[]> {
        if (user.role === UserRole.SUPER_ADMIN) {
            return this.nodesRepository.find();
        }
        return this.nodesRepository.find({ where: { cityId: user.cityId } });
    }

    async createPipe(createPipeDto: any, user: any): Promise<NetworkPipe> {
        const startNode = await this.nodesRepository.findOne({ where: { id: createPipeDto.start_node_id } });
        const endNode = await this.nodesRepository.findOne({ where: { id: createPipeDto.end_node_id } });

        if (!startNode || !endNode) {
            throw new NotFoundException('Start Node or End Node not found');
        }

        const cityId = user.role === UserRole.SUPER_ADMIN ? (createPipeDto.cityId || null) : user.cityId;

        const pipe = this.pipesRepository.create({
            ...createPipeDto,
            cityId,
            start_node: startNode,
            end_node: endNode,
            geometry: {
                type: 'LineString',
                coordinates: [
                    (startNode.geometry as any).coordinates,
                    (endNode.geometry as any).coordinates
                ]
            }
        } as Partial<NetworkPipe>);

        return this.pipesRepository.save(pipe);
    }

    async findAllPipes(user: any): Promise<NetworkPipe[]> {
        if (user.role === UserRole.SUPER_ADMIN) {
            return this.pipesRepository.find({
                relations: ['start_node', 'end_node']
            });
        }
        return this.pipesRepository.find({
            where: { cityId: user.cityId },
            relations: ['start_node', 'end_node']
        });
    }
    async findPublicNodes(cityId?: string): Promise<NetworkNode[]> {
        if (cityId) {
            return this.nodesRepository.find({ where: { cityId } });
        }
        return this.nodesRepository.find();
    }

    async findPublicPipes(cityId?: string): Promise<NetworkPipe[]> {
        if (cityId) {
            return this.pipesRepository.find({
                where: { cityId },
                relations: ['start_node', 'end_node']
            });
        }
        return this.pipesRepository.find({
            relations: ['start_node', 'end_node']
        });
    }
}
