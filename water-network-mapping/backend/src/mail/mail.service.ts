import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        const port = this.configService.get<number>('SMTP_PORT', 587);
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port,
            secure: port === 465,
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    private get fromAddress(): string {
        return this.configService.get<string>('SMTP_FROM', 'noreply@waternet.local');
    }

    async sendWorkerAssignmentEmail(
        workerEmail: string,
        workerName: string,
        complaintId: string,
        complaintType: string,
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to: workerEmail,
                subject: `[WaterNet] You have been assigned complaint #${complaintId.substring(0, 8)}`,
                html: `<p>Hello ${workerName},</p>
                       <p>You have been assigned to a <strong>${complaintType}</strong> complaint (ID: #${complaintId.substring(0, 8)}).</p>
                       <p>Please log in to the WaterNet dashboard to view details and begin work.</p>
                       <p>-- WaterNet System</p>`,
            });
            this.logger.log(`Assignment email sent to ${workerEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send assignment email to ${workerEmail}`, error);
        }
    }

    async sendReporterResolutionEmail(
        reporterEmail: string,
        complaintId: string,
        complaintType: string,
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to: reporterEmail,
                subject: `[WaterNet] Your ${complaintType} report has been resolved`,
                html: `<p>Hello,</p>
                       <p>We are writing to inform you that your <strong>${complaintType}</strong> report (ID: #${complaintId.substring(0, 8)}) has been <strong>resolved</strong>.</p>
                       <p>Thank you for helping keep our water network safe.</p>
                       <p>-- City Water Department</p>`,
            });
            this.logger.log(`Resolution email sent to ${reporterEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send resolution email to ${reporterEmail}`, error);
        }
    }
}
