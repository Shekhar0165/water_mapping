import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ComplaintStatus } from './entities/complaint.entity';
import { UserRole } from '../users/user.entity';

@Controller('complaints')
export class ComplaintsController {
    constructor(private readonly complaintsService: ComplaintsService) { }

    // Public endpoint - Citizens don't need to be logged in to report a leak
    @Post('public-report')
    async createPublicComplaint(@Body() createComplaintDto: any) {
        return this.complaintsService.createComplaint(createComplaintDto);
    }

    // Protected endpoint - Workers/Admins reporting issues
    @UseGuards(JwtAuthGuard)
    @Post()
    async createAuthComplaint(@Request() req: any, @Body() createComplaintDto: any) {
        // Attach the logged-in user's ID to the complaint
        return this.complaintsService.createComplaint(createComplaintDto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllComplaints(@Request() req: any) {
        return this.complaintsService.findAllComplaints(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-assignments/list')
    async findMyAssignedComplaints(@Request() req: any) {
        return this.complaintsService.findAssignedComplaints(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.complaintsService.findOneComplaint(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.CITY_PLANNER)
    @Patch(':id/assign')
    async assignWorker(
        @Param('id') id: string,
        @Body('workerId') workerId: string,
    ) {
        return this.complaintsService.assignWorker(id, workerId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: ComplaintStatus,
        @Request() req: any
    ) {
        // If a worker marked it "InProgress", auto-assign them
        const workerId = status === ComplaintStatus.IN_PROGRESS ? req.user.userId : undefined;
        return this.complaintsService.updateStatus(id, status, workerId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/resolve')
    async resolveComplaint(
        @Param('id') id: string,
        @Body('resolutionMediaUrl') resolutionMediaUrl: string,
        @Request() req: any
    ) {
        return this.complaintsService.resolveComplaint(id, resolutionMediaUrl, req.user.userId);
    }
}
