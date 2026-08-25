import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma-config/prisma.service";
import { CreateFinancialInstitutionDto } from "./dto/create-financial-institutions.dto";
import { UpdateFinancialInstitutionsDto } from "./dto/update-financial-institutions.dto";

@Injectable()
export class FinancialInstitutionsService {
    constructor (private prisma:PrismaService){}

    async create(dto: CreateFinancialInstitutionDto , userId:string){

        const create = this.prisma.financialInstitutions.create({
            data:{
                userId:userId,
                ...dto
            }
        })
        if(!create) throw new BadRequestException('there was erroor to create a new financial institutions ')
        return {message: 'new financial institutions created'}
    }
    async show(userId: string){
        const get =  await this.prisma.financialInstitutions.findMany({where:{userId}})
        if(!get) throw new BadRequestException('there was an error to show all financial institutions')
    }
    async update (dto: UpdateFinancialInstitutionsDto , userId: string , id:string){
        const update = await this.prisma.financialInstitutions.update({
            where:{userId , id},
            data:{...dto}
        })
        if(!update) throw new BadRequestException('there an error to update financial institutions')
        return update
    }
    async desative(userId:string , id: string){
        const desactive =  await this.prisma.financialInstitutions.update({
            where:{userId , id},
            data:{status: 'DESACTIVE'}
        })
        return desactive
    }
    async active(userId:string , id: string){
        const active =  await this.prisma.financialInstitutions.update({
            where:{userId , id},
            data:{status: 'ACTIVE'}
        })
        return active
    }
}