import { PrismaService } from "@/prisma-config/prisma.service";
import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import Redis from "ioredis";
import { CreateInvestement, CreateInvestmentCategoryFixed, CreateInvestmentCategoryVariable, CreateMovementInvestment } from "./dto/create-investment.dto";
import { FindAllMovementsInvestmentResponse, FindInvestmentResponse } from "./entity/invesment-find-entity";
import { StockPricesService } from "@/apis/stock-prices/stock-prices.service";
import { MarketCoingeckoCronService } from "@/apis/market-coingecko/market-coingecko.service";
import { InvestmentCategory, InvestmentType, } from "@generated/prisma/enums";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Decimal } from "@prisma/client/runtime/index-browser";
import { MovementWithCategory } from "../movements/entity/return.movements";
import { unescape } from "querystring";

@Injectable()
export class  InvestmentsService {
    private readonly cacheInvestment = `investment:`
        private readonly cacheMovementInvestment= `movementInvestment`
    constructor(
        private readonly prisma: PrismaService,
        @Inject("REDIS_CLIENT") private readonly redis: Redis,
        private readonly stockPriceService: StockPricesService,
        private readonly marketCoingecko: MarketCoingeckoCronService
    ){}

    async createInvestment(dto: CreateInvestement,userId: string){
        let tiker = ''
        let category: InvestmentCategory                                                                        = InvestmentCategory.FIXED
        
        if(dto.type==='CRYPTO'){
            const searchResultCoins = await this.marketCoingecko.searchSymbol(dto.name)
            const tickerToSave = searchResultCoins[0].symbol
            category = InvestmentCategory.VARIABLE
            const tikerSaved = await this.prisma.marketPrice.findFirst({
                where:{ticker: tickerToSave}
            })
            tiker = tickerToSave
            if(!tikerSaved){
                 await this.prisma.marketPrice.create({
                    data:{
                        ticker: tiker,
                         currentPrice: 0
                    }
                })
            }
        }
        if(dto.type==='STOCK'){
            const searchResults = await this.stockPriceService.searchStocks(dto.name);
            const tickerToSave = searchResults[0].symbol
            category = InvestmentCategory.VARIABLE
            const tikerSaved = await this.prisma.marketPrice.findFirst({
                where:{ticker: tickerToSave}
            })
            tiker = tickerToSave
            if(!tikerSaved){
                 await this.prisma.marketPrice.create({
                    data:{
                        ticker: tiker,
                         currentPrice: 0
                    }
                })
                
            }
        }
         

            
        if (tiker.length === 0 || tiker === undefined) {
            throw new BadRequestException(`No market asset found for "${dto.name}"`);
        }
        const createInvestment = await this.prisma.investmentAccounts.create({
            data:{
                userId,
                ticker: tiker,
                category: category,
                ...dto
            }
        })


        
        await this.stockPriceService.handleCron()
        await this.marketCoingecko.handleCron()
        this.invalidCache(userId)
        return createInvestment
        
    }
    async CreateMovementInvestment(dto: CreateMovementInvestment , userId: string, symbol?: string){
        await this.findInvestmentAndType(userId,dto.investmentId)
        const movementInvestment = await this.prisma.movementsInvestmentAccounts.create({
            data:{
                investmentAccount: {
                    connect: { id: dto.investmentId }
                },
                ...dto
            }
        })
        const movementRecord = await this.prisma.movementsInvestmentAccounts.findFirst({
            where: { id: movementInvestment.id },
            include: {
                movement: {
                    where: { id: movementInvestment.movementId },
                    select: { amount: true }
                }
            }
        });
        const investmentCategoryFixed = await this.prisma.investmentCategorieFixed.findFirst({
            where:{id: categoryFixedId, userId}
        })
        const amountMovement = movementRecord?.movement[0].amount
        const investment = await this.prisma.investmentAccounts.findFirst({
            where:{id: movementInvestment.investmentAccountId},
            select:{type: true , ticker: true ,  name: true}
        })
        

        if(!investment ||  !amountMovement ){
            throw new BadRequestException(' no data must not null')
        }
        if(investment.type === 'CDT' || investment.type === 'LOAN' || investment.type === 'REAL_ESTATE'){
            if(!investmentCategoryFixed?.interest) throw new BadRequestException('no data must null or undefined')
        }
        await this.actions(
            investment?.type , 
            amountMovement , 
            investmentCategoryFixed?.interest, 
            movementInvestment.transactionDate ,
            null,
            movementInvestment.id,
            userId
        )
        
        this.invalidCache(userId)
        return movementInvestment
    }
    async findAllMovementsInvestment(id: string,investmentId: string,userId: string): Promise<FindAllMovementsInvestmentResponse[]>{
        const cacheMovementInvestment = await this.redis.get(`${this.cacheMovementInvestment}${userId}`)
        if(cacheMovementInvestment){
            const cacheResponse: FindAllMovementsInvestmentResponse[] = JSON.parse(cacheMovementInvestment)
            return cacheResponse
        }
        const getAllMovementsInvestment = await this.prisma.movementsInvestmentAccounts.findMany({
            where:{investmentAccountId: investmentId},
            include:{
                movement:{where:{movmentsInvementsId: id}}
            }
        })
        await this.redis.set(`${this.cacheMovementInvestment}${userId}` , JSON.stringify(getAllMovementsInvestment))
        return getAllMovementsInvestment
    }
    async updateFeePaied (
        id: string,
        fee: number,
        userId: string
    ){
        const feePaiedSaved = await this.prisma.investmentCategorieFixed.findFirst({
            where:{id , userId},
            select:{feePaied: true}
        })
        if(!feePaiedSaved || feePaiedSaved === undefined ) throw new BadRequestException("the fee must not null or undefined")
        let currentPaied = feePaiedSaved.feePaied
        if( currentPaied=== fee || !currentPaied){
            throw new BadRequestException("You have already paid all the installments.")
        }
        currentPaied = currentPaied + fee
        
    }
     createInvestmentFixed(dto: CreateInvestmentCategoryFixed , investmentAccountId: string , userId:string){
        const investment = await this.prisma.investmentAccounts.findFirst({
            where:{id: investmentAccountId},
            select:{type: true , ticker: true ,  name: true}
        })
        if(!investment) throw new BadRequestException('no data must null or undefined')
        await this.prisma.investmentCategorieFixed.create({
                data:{
                    name:investment.name,
                    userId,
                    fee: dto.fee,
                    feePaied: dto.feePaied
                }
            })
    }
     createInvestmentVariable(dto: CreateInvestmentCategoryVariable , userId: string){
        await this.prisma.investmentCategorieVariable.create({
                data:{
                    userId,
                    symbol:  dto.symbol,
                    quantity: dto.quantity,
                }
            })
    }
    private  async findInvestmentAndType (userId:string, investmentId:string){
        const cache = await this.redis.get(`${this.cacheInvestment}${userId}`)
        if(cache){
            const cacheResponse: FindInvestmentResponse = JSON.parse(cache)
            return cacheResponse
        }
        const findInvestment = await this.prisma.investmentAccounts.findFirstOrThrow({where:{userId , id: investmentId}})
        if(!findInvestment)throw new BadRequestException('you need it an investment')
        return findInvestment
    }
    private async invalidCache(userId: string){
        await this.redis.del(`${this.cacheInvestment}${userId}`)
        await this.redis.del(`${this.cacheMovementInvestment}${userId}`)
    }
    private async actions (
        type: InvestmentType,
        initialMovement: Decimal,
        interest: Decimal | null | undefined,
        startDate: Date,
        investmetAcountId: string | null,
        userId: string,
        movementsInvestmentId: string

    ){
        switch (type){
            case 'CDT':
               if(
                    !initialMovement || 
                    !interest || 
                    initialMovement === undefined || 
                    interest  === undefined 
                ) {
                    throw new BadRequestException('the amount and interest must not null or undefined')
                }
               const cdt = { 
                   initialAmount: initialMovement,
                   annualRate: interest,
                   startDate: startDate,
                   movementInvestmentId: movementsInvestmentId,
                   userId: userId
                }
                await this.calculateCdts(cdt)
                break;
            case 'REAL_ESTATE':
                if(
                    !initialMovement || 
                    !interest || 
                    initialMovement === undefined || 
                    interest  === undefined 
                ) {
                    throw new BadRequestException('the amount and interest must not null or undefined')
                }

                const realState = {
                    purchasePrice: initialMovement, 
                    annualAppreciationRate: interest,
                    purchaseDate: startDate,
                    movementInvestmentId: movementsInvestmentId,
                    userId: userId
                }
                await this.calculateRealEstateValue(realState)
                break;
            case 'CRYPTO':
                if(!investmetAcountId){
                    throw new BadRequestException('the id of Investment acount must not null')
                }
                await this.calculateCryptosAndStockPrices(investmetAcountId,movementsInvestmentId,userId)
                break;
            case 'STOCK':
                if(!investmetAcountId){
                    throw new BadRequestException('the id of Investment acount must not null')
                }
                await this.calculateCryptosAndStockPrices(investmetAcountId,movementsInvestmentId,userId)
                break;
        }
    }
    @Cron(CronExpression.EVERY_WEEK)
    private async calculateCdts(cdt:{ 
        initialAmount: Decimal,
        annualRate: Decimal,
        startDate: Date,
        movementInvestmentId: string,
        userId: string
    }) {
       const now = new Date()
       
       const startDate = new Date(cdt.startDate);
       
       const diffTime = Math.abs(now.getTime() - startDate.getTime());
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

       const years = diffDays / 365;
       const initialAmountNum = Number(cdt.initialAmount);
       const annualRateNum = Number(cdt.annualRate);

       const currentValue = initialAmountNum * Math.pow(1 + annualRateNum, years);
       await this.updateBalances(
        cdt.movementInvestmentId,
        cdt.userId,
        currentValue
       )
       return currentValue

    }
    
    @Cron(CronExpression.EVERY_WEEK)
    private async calculateRealEstateValue(
        realState:{
            purchasePrice: Decimal;    
            annualAppreciationRate: Decimal;
            purchaseDate: Date;
            movementInvestmentId: string;
            userId: string
        }
    ): Promise<Decimal> {
        if (!realState.purchasePrice || !realState.annualAppreciationRate || !realState.purchaseDate) {
            return Decimal.ROUND_FLOOR(0);
        }

        const now = new Date();
        const purchaseDate = new Date(realState.purchaseDate);
        
        const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const years = diffDays / 365;

        const purchasePriceNum = Number(realState.purchasePrice);
        const appreciationRateNum = Number(realState.annualAppreciationRate);

        const currentValue = purchasePriceNum * Math.pow(1 + appreciationRateNum, years);
        await this.updateBalances(
        realState.movementInvestmentId,
        realState.userId,
        currentValue
       )
        return Number(currentValue.toFixed(2));
    }
    @Cron(CronExpression.EVERY_WEEK)
    private async calculateCryptosAndStockPrices(
        investmentAccountId: string,
        categoriesVariablesId: string,
        movementsInvestmentId: string,
        userId: string,

    ){
        const account = await this.prisma.investmentAccounts.findUnique({
            where: { id: investmentAccountId },
            select: { ticker: true , benefit: true, id: true},
        });
        const categoriesVariables = await this.prisma.investmentAccounts.findMany({
            where: { id: investmentAccountId, userId },
            include:{ investmentCategorieVariable:{
                where:{id: categoriesVariablesId, userId}
            }}
        });

        if (!account || !account.ticker) {
            throw new BadRequestException('Investment account or ticker not found');
        }

        const marketPriceRecord = await this.prisma.marketPrice.findFirst({
            where: { ticker: account.ticker }
        });


        const currentUnitPrice = marketPriceRecord?.currentPrice 

        
        const quantity = categoriesVariables.map((quat) => {
            return quat.investmentCategorieVariable?.quantity
        })
        const typeMovement = await this.prisma.movementsInvestmentAccounts.findMany({
            where:{ id: movementsInvestmentId},
            select:{type: true}
        })
        

    
        for (const item of categoriesVariables) {
            const quantityAll = quantity.map((qu)=>{
                return qu
            })
            const categorieId = categoriesVariables.map((id) =>{
                return id.investmentCategorieVariable?.id
            })
            if(categorieId === undefined) throw new BadRequestException('somethin categories investment is null')

            if(quantityAll === undefined && categorieId === undefined)throw new BadRequestException('quantity must not undefined')
            const benefit = account.benefit
            for(const j of typeMovement){
                if (j.type === 'BUY') {
                await this.prisma.investmentCategorieVariable.update({
                    where:{id: categorieId},
                    data:{quantity:{increment: quantityAll}}
                });
                await this.prisma.investmentAccounts.update({
                    where:{id: account.id},
                    data:{benefit:{increment: benefit}}
                })
            } else if (j.type === 'SELL') {
                await this.prisma.investmentCategorieVariable.update({
                    where:{id: categorieId},
                    data:{quantity:{decrement: quantityAll}}
                });
                await this.prisma.investmentAccounts.update({
                    where:{id: account.id},
                    data:{benefit:{decrement: benefit}}
                })
            }
            }
            
        }
    }
    private  async calculateLoan(
        fee: number, 
        interest: Decimal,
        investmentId: string,
        userId: string,
        movementId: string,
        investmentAcountId: string
    ){
        
        await this.findAndVerifyOwnership(movementId,userId)
        const amountMovements = await this.prisma.movements.findFirst({
            where:{id: movementId},
            select:{amount: true}
        })
        const investmentFromMovements = amountMovements?.amount
        if(investmentFromMovements === undefined || !investmentFromMovements) throw new BadRequestException("the amount must not null or undefined")
        const feeCapital = investmentFromMovements.mul(fee)
        const feeInterest = investmentFromMovements.mul(interest)
        const feeTotal = feeCapital.plus(feeInterest)
        await this.prisma.movementsInvestmentAccounts.update({
            where:{id: investmentId , investmentAccountId: investmentAcountId},
            data:{}
        })

        await this.

        
    }
    private async findAndVerifyOwnership(id: string, userId: string):Promise<MovementWithCategory> {
            
            const cacheKey = `movement:${id}`;
            const cacheData = await this.redis.get(cacheKey);
    
            if (cacheData) {
                const movement: MovementWithCategory = JSON.parse(cacheData);
                if (movement.category?.userId !== userId ) {
                    throw new ForbiddenException('You cannot access this movement');
                }
                return movement;
            }
    
            const movement = await this.prisma.movements.findUnique({
                where: { id },
                include: {
                    category: true,
                    institutionFinancial: true,
                }
            });
    
            if (!movement) throw new NotFoundException('Movement not found');
            if (movement.category.userId !== userId) throw new ForbiddenException('You cannot access this movement');
    
            await this.redis.set(
                cacheKey,
                JSON.stringify(movement),
            );
            return movement;
        }
    
    private async updateBalances(movementsInvestmentId: string, userId:string , benefit: number){
        await this.prisma.movementsInvestmentAccounts.update({
        where:{id: movementsInvestmentId},
        data:{benefit:{increment: benefit}}
       })
       await this.prisma.balanceSection.update({
        where:{userId_nameBalance: { userId: userId,nameBalance: 'INVESTMENTS' }},
        data:{balance:{increment: benefit}}
      })
      await this.prisma.balanceSection.update({
        where:{userId_nameBalance: { userId: userId,nameBalance: 'TOTAL' }},
        data:{balance:{increment: benefit}}
      })
      await this.prisma.balanceSection.update({
        where:{userId_nameBalance: { userId: userId,nameBalance: 'AVAILABLE' }},
        data:{balance:{increment: benefit}}
      })
   }
    
}