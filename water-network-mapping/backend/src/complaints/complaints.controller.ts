import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { JwtAuthGuard } from '../auth/guards';
import { ComplaintStatus } from './entities/complaint.entity';

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
    async findAllComplaints() {
        return this.complaintsService.findAllComplaints();
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
}
