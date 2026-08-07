import { Injectable, InternalServerErrorException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailTemplates } from './templates/resend.templates';

export interface SendEmailOption {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
}

@Injectable()
export class ResendService {
    private resend: Resend;
    private defaultFrom: string;

    constructor(private readonly configService: ConfigService){
        const apiKey = this.configService.get<string>("RESEND_API_KEY")
        this.defaultFrom = this.configService.get<string>('RESEND_FROM_EMAIL')?? 'onboarding@resend.dev';

        this.resend = new Resend(apiKey);
    }
    async sendEmail({to,subject,html,from}: SendEmailOption){
        try{
            const {data  , error} = await this.resend.emails.send({
            from: from ?? this.defaultFrom,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            });
            if(error) throw new InternalServerErrorException(error.message)
            return data
            
        }
        catch(err){
            console.log('THE PROBLEM IS: ' , err)
            throw new InternalServerErrorException('there was an error sending the email ')
        }
    }

    async sendEmailVerify(toEmail:string , code:string){
        const template = EmailTemplates.verification(code)

        return this.sendEmail({
            to: toEmail,
            subject: template.subject,
            html: template.html
        })
    }
}

