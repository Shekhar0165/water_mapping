import { Controller, Get, Query } from '@nestjs/common';
import { MapsService } from './maps.service';

@Controller('public-maps')
export class PublicMapsController {
    constructor(private readonly mapsService: MapsService) { }

    @Get('nodes')
    async findPublicNodes(@Query('cityId') cityId?: string) {
        return this.mapsService.findPublicNodes(cityId);
    }

    @Get('pipes')
    async findPublicPipes(@Query('cityId') cityId?: string) {
        return this.mapsService.findPublicPipes(cityId);
    }
}
