import { BalanceSection } from "@generated/prisma/browser";

export type BalancesResponse = Omit<BalanceSection, 'userId' | 'createdAt' | 'updatedAt'>& {
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}