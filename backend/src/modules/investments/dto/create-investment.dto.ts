import { NormalizedNumber } from '@/common/decorator/normalized-amount.decorator'
import { InvestmentCategory, InvestmentHorizon, InvestmentType, TransactionType } from '@generated/prisma/enums'
import { Sse } from '@nestjs/common'
import { Decimal } from '@prisma/client/runtime/client'
import { IsDecimal, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { string } from 'joi'

export class CreateInvestement {
    @IsString()
    @IsNotEmpty()
    name!: string


    @IsEnum(InvestmentType)
    @IsNotEmpty()
    type!: InvestmentType

    @IsEnum(InvestmentHorizon)
    @IsNotEmpty()
    horizon!: InvestmentHorizon
    @IsNumber()
    @NormalizedNumber()
    goal!: number
    @IsNumber()
    @NormalizedNumber()
    benefit!: number
}

export class CreateMovementInvestment {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    investmentId!: string
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    movementId!: string
    @IsEnum(TransactionType)
    type!: TransactionType
    @IsDecimal()
    quantity!: Decimal
}
export class CreateInvestmentCategoryVariable{
    @IsString()
    symbol!: string
    @IsDecimal()
    quantity!: Decimal
}
export class CreateInvestmentCategoryFixed {
    @IsString()
    name!:  string
    @IsNumber()
    feePaied!: number
    @IsNumber()
    fee!: number
    @IsDecimal()
    interest?: Decimal
}

