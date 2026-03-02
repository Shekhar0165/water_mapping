import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetworkNode } from './entities/node.entity';
import { NetworkPipe } from './entities/pipe.entity';

@Injectable()
export class MapsService {
    constructor(
        @InjectRepository(NetworkNode)
        private nodesRepository: Repository<NetworkNode>,
        @InjectRepository(NetworkPipe)
        private pipesRepository: Repository<NetworkPipe>,
    ) { }

    async createNode(createNodeDto: any): Promise<NetworkNode> {
        let geometry = null;
        if (createNodeDto.latitude !== undefined && createNodeDto.longitude !== undefined) {
            geometry = {
                type: 'Point',
                coordinates: [createNodeDto.longitude, createNodeDto.latitude]
            };
        }

        const node = this.nodesRepository.create({
            ...createNodeDto,
            geometry,
        } as Partial<NetworkNode>);
        return this.nodesRepository.save(node);
    }

    async findAllNodes(): Promise<NetworkNode[]> {
        return this.nodesRepository.find();
    }

    async createPipe(createPipeDto: any): Promise<NetworkPipe> {
        const startNode = await this.nodesRepository.findOne({ where: { id: createPipeDto.start_node_id } });
        const endNode = await this.nodesRepository.findOne({ where: { id: createPipeDto.end_node_id } });

        if (!startNode || !endNode) {
            throw new NotFoundException('Start Node or End Node not found');
        }

        const pipe = this.pipesRepository.create({
            ...createPipeDto,
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

    async findAllPipes(): Promise<NetworkPipe[]> {
        return this.pipesRepository.find({
            relations: ['start_node', 'end_node']
        });
    }
}
