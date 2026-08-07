import { Body, Controller, Delete, Ip, Param, Patch, Post , Req, Res, UseGuards} from "@nestjs/common";
import {
    CreateUserPendingDto,
    PayloadValidateDto,
    SingInDto,
    VerifyEmailDto,
    SentEmailDto
} from "./dto/jwt.dto";
import { AuthService } from "./auth.service";
import { type Request , type Response} from "express";
import { ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { CurrentUser } from "@/common/decorator/current-user.decorator";
import { ForgotPasswordDto} from "./dto/jwt-update";
import { GoogleAuth } from "google-auth-library";
import { GoogleLoginDto } from "./dto/google-login.dto";

@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService,
        private configService: ConfigService
        
    ){}
    @Post('google')
    async googleLogin(
        @Body() dto: GoogleLoginDto,
        @Req() req:Request,
        @Res({passthrough:true}) res:Response
    ){
        const userAgent = req.headers['user-agent'] || 'Unknown'
        const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1'
        const {accessToken , refreshToken} = await this.authService.loginWithGoogle(
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
        return {message: 'Google login successful'}
    }
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
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(
        @CurrentUser() dto: PayloadValidateDto,
        @Res({passthrough : true}) res: Response
    ){
        await this.authService.logOut(dto)

        res.clearCookie('access_token')
        res.clearCookie('refresh_token')
        return {message: 'logout successful'}
    }
    @Post('logout-all')
    @UseGuards(JwtAuthGuard)
    async logoutAll(
        @CurrentUser('sub') userId: string,
        @Res() res:Response
    ){
        const result = await this.authService.logoutAll(userId)
        res.clearCookie('access_token')
        res.clearCookie('refresh_token')
        return result
    }
    @Patch('sessions/:id/close')
    @UseGuards(JwtAuthGuard)
    async closeSessionRemte(
        @Param('id') sessionId: string,
        @CurrentUser('sub') user: string,
        @Body() password:string
    ){
        return this.authService.closeSessionRemote(sessionId, user , password)
    }
    @Post('sent-code-password')
    async sentEmailPassword(
        @Body() dto: SentEmailDto
    ){
        return this.authService.sentEmailForgotPassword(dto)
    }
    @Patch('reset-forgot-password')
    async(
        @Body() dto: ForgotPasswordDto
    ){
        return this.authService.resetPassword(dto)
    }

}