import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MapsService } from './maps.service';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('maps')
export class MapsController {
    constructor(private readonly mapsService: MapsService) { }

    @Post('nodes')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.CITY_PLANNER, UserRole.WORKER)
    async createNode(@Request() req: any, @Body() createNodeDto: any) {
        return this.mapsService.createNode(createNodeDto, req.user);
    }

    @Get('nodes')
    async findAllNodes(@Request() req: any) {
        return this.mapsService.findAllNodes(req.user);
    }

    @Post('pipes')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.CITY_PLANNER, UserRole.WORKER)
    async createPipe(@Request() req: any, @Body() createPipeDto: any) {
        return this.mapsService.createPipe(createPipeDto, req.user);
    }

    @Get('pipes')
    async findAllPipes(@Request() req: any) {
        return this.mapsService.findAllPipes(req.user);
    }
}
