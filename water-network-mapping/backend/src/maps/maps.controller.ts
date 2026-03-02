import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MapsService } from './maps.service';
import { JwtAuthGuard } from '../auth/guards';

@UseGuards(JwtAuthGuard)
@Controller('maps')
export class MapsController {
    constructor(private readonly mapsService: MapsService) { }

    @Post('nodes')
    async createNode(@Body() createNodeDto: any) {
        return this.mapsService.createNode(createNodeDto);
    }

    @Get('nodes')
    async findAllNodes() {
        return this.mapsService.findAllNodes();
    }

    @Post('pipes')
    async createPipe(@Body() createPipeDto: any) {
        return this.mapsService.createPipe(createPipeDto);
    }

    @Get('pipes')
    async findAllPipes() {
        return this.mapsService.findAllPipes();
    }
}
