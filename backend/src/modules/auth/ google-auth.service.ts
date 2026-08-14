import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { GoogleLoginDto } from "./dto/google-login.dto";

@Injectable()
export class AuthGoogleService {
    private readonly googleCLient: OAuth2Client

    constructor(
        private configService: ConfigService,
    ){
        const clientId = this.configService.get<string>('google.clientId')
        this.googleCLient = new OAuth2Client(clientId)
    }
    async verifyTokenGoogle(dto: GoogleLoginDto){
        try{
            const ticket = await this.googleCLient.verifyIdToken({
                idToken: dto.idToken,
                audience: this.configService.get('google.clientId')
            })
            const payload = ticket.getPayload()
            if(!payload || !payload.email) throw new UnauthorizedException('Invalid Google token')
            
            return{
                name: payload.name,
                email: payload.email,
                googleId: payload.sub,
                avatar: payload.picture,
                language: payload.locale
            }
        }catch(err){
            throw new UnauthorizedException('the token could not be verified')
        } 
    }
}