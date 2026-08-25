import { 
    Body, 
    Controller,
    Param, 
    Patch, 
    Post , 
    Req, 
    Res, 
    UseGuards
} from "@nestjs/common";
import {
    CreateUserPendingDto,
    SingInDto,
    VerifyEmailDto,
    SentEmailDto,
    GenerateTokenDto,
    PayloadLogOutDto
} from "./dto/jwt.dto";
import { AuthService } from "./auth.service";
import { type Request , type Response} from "express";
import { ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { CurrentUser } from "@/common/decorator/current-user.decorator";
import { ForgotPasswordDto} from "./dto/jwt-update";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";

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
        const googleLogin= await this.authService.loginWithGoogle(
            dto,
            userAgent,
            clientIp
        )
        const isProd : boolean = this.configService.get('app.nodeEnv') === 'production'

        res.cookie('access_token' , googleLogin.accessToken , {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 15

        });

        res.cookie('refresh_token' , googleLogin.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 *24 * 7 
        })
        return googleLogin.user
    }
    @Post('sign-up')
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
        @Res({passthrough: true}) res:Response,
    ){
        const userAgent = req.headers['user-agent'] || 'Unknown'
        const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1'

        const {accessToken,refreshToken} = await this.authService.verifyEmail(
            dto,
            userAgent,
            clientIp,
        )

        const isProd : boolean = this.configService.get('app.nodeEnv') === 'production'

        res.cookie('access_token' , accessToken , {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 15

        });

        res.cookie('refresh_token' , refreshToken , {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 *24 * 7 
        })

        return {message: 'verified user, successful access'}
    }
    @Post('sign-in')
    async singIn (
        @Body() dto:SingInDto,
        @Req() req: Request,
        @CurrentUser('jti') jti: string,
        @Res({passthrough: true}) res: Response
    ){
        const userAgent = req.headers['user-agent'] || 'Unknown'
        const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1'

        const {accessToken  , refreshToken} = await this.authService.singIn(
            dto,
            userAgent,
            clientIp,
            jti
        )
        const isProd : boolean = this.configService.get('app.nodeEnv') === 'production'

        res.cookie('access_token' , accessToken , {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 15

        });

        res.cookie('refresh_token' , refreshToken , {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 *24 * 7 
        })

        return {message: 'successful sing In '}
    }
    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    async refresh (
        @CurrentUser() dto: GenerateTokenDto,
        @Res({passthrough: true})  res: Response
    ){

        const {accessToken  , refreshToken} = await this.authService.refreshToken(dto)
        const isProd : boolean = this.configService.get('app.nodeEnv') === 'production'

        res.cookie('access_token' , accessToken , {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60  * 15 

        });

        res.cookie('refresh_token' , refreshToken , {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 *24 * 7 
        })

        return {success: true ,message: 'successful refresh token '}
    }
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(
        @CurrentUser() dto: PayloadLogOutDto,
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
        @CurrentUser() dto: PayloadLogOutDto,
        @Res() res:Response
    ){
        const result = await this.authService.logoutAll(dto)
        res.clearCookie('access_token')
        res.clearCookie('refresh_token')
        return result
    }
    @Patch('sessions-close/:sessionId')
    @UseGuards(JwtAuthGuard)
    async closeSessionRemte(
        @CurrentUser() dto: PayloadLogOutDto,
        @Param('sessionId') sessionId: string,
        @Body('password') password?:string
    ){
        return this.authService.closeSessionRemote(dto,sessionId, password)
    }
    @Post('sent-code-password')
    async sentEmailPassword(
        @Body() dto: SentEmailDto
    ){
        return this.authService.sentEmailForgotPassword(dto)
    }
    @Patch('reset-forgot-password')
    async resetPassword(
        @Body() dto: ForgotPasswordDto,
    ){
        return this.authService.resetPassword(dto)
    }
    @Post('resend-code-email')
    async resendCodeVerifyEmail(
        @Body('email') email: string
    ){
        return this.authService.resendCode('verifyEmail' , email)
    }
    @Post('resend-code-password')
    async resendCodeForgotPassword(
        @Body('email') email: string
    ){
        return this.authService.resendCode('forgotPassword' , email)
    }

}