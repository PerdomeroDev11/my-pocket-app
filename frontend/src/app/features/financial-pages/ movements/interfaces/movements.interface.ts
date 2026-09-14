export enum TypeMovementEnum {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    SAVING = 'SAVING',
    INVESTMENT = 'INVESTMENT',
}

export interface CreateMovementInterface {
    name?: string;
    description?: string;
    amount: number;
    date: string;
    isPay: boolean;
    typeMovement: TypeMovementEnum;
    institutionFinancialId?: string | null;
}

export interface MovementResponseInterface {
    id: string;
    name?: string | null;
    description?: string | null;
    amount: number;
    expectAmount?: number | null;
    date: string | Date;
    isPay: boolean;
    typeMovement: TypeMovementEnum;
    institutionFinancial: { id: string; name: string } | null;
    createdAt: Date;
}
