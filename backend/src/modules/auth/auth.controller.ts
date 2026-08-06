import { Body, Controller, Post , Req, Res} from "@nestjs/common";
import { CreateUserPendingDto, LoginDto, SingInDto, VerifyEmailDto } from "./dto/jwt.dto";
import { AuthService } from "./auth.service";
import { type Request , type Response} from "express";
import { ConfigService } from "@nestjs/config";

@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService,
        private configService: ConfigService
        
    ){}
    @Post('sing-up')
    async singUp(
        @Body() dto: CreateUserPendingDto
    ) {
        await this.authService.singUp(dto);
        return {message: 'code sent'}
    }
    @Post('verify-email')
    async emailVerify(
        @Body() dto: VerifyEmailDto,
        @Req() req: Request,
        @Res({passthrough: true}) res:Response 
    ){
        const userAgent = req.headers['user-agent'] || 'Unknown'
        const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1'

        const {accessToken,refreshToken} = await this.authService.verifyEmail(
            dto,
            userAgent,
            clientIp
        )

        const isProd : boolean = this.configService.get('app.nodeEnv') === 'production'

        res.cookie('access_token' , accessToken , {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 15// 15 minutes

        });

        res.cookie('referesh_token' , refreshToken , {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 *24 * 7 // 7 days
        })

        return {message: 'verified user, successful access'}
    }
    @Post('sing-in')
    async singIn (
        @Body() dto:SingInDto,
        @Req() req: Request,
        @Res({passthrough: true}) res: Response
    ){
        const userAgent = req.headers['user-agent'] || 'Unknown'
        const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1'

        const {accessToken  , refreshToken} = await this.authService.singIn(
            dto,
            userAgent,
            clientIp
        )
        const isProd : boolean = this.configService.get('app.nodeEnv') === 'production'

        res.cookie('access_token' , accessToken , {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 15// 15 minutes

        });

        res.cookie('referesh_token' , refreshToken , {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 *24 * 7 // 7 days
        })

        return {message: 'successful sing In '}
    }
}