import { InvestmentCategory, InvestmentHorizon, InvestmentType, TransactionType } from "@generated/prisma/enums";

export type FindInvestmentResponse  = {
    id: string;
    name: string;
    categorieFixedId: string;
    categorieVariableId: string
    category: InvestmentCategory;
    type: InvestmentType;
    horizon: InvestmentHorizon;
    createdAt: Date;
    userId: string;
}
export type FindAllMovementsInvestmentResponse = {
    id: string;
    movementId: string;

    type: TransactionType;
    transactionDate: Date;
    updateAt: Date;
    investmentAccountId: string;
}