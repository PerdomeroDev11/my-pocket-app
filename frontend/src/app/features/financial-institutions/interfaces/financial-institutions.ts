export enum typeInstitutionEnum {
    BANK = 'BANK',
    CASH = 'CASH',
    CRYPTO = 'CRYPTO',
    DIGITALWILLET = 'DIGITALWILLET'
}
export enum statusInstitutionEnum {
    ACTIVE = 'ACTIVE',
    DESACTIVE = 'DESACTIVE',
}

export interface CreateFinancialInstitutionInterface {
    name: string;
    type: typeInstitutionEnum;
}
export interface UpdateFinancialInstitutionInterface extends CreateFinancialInstitutionInterface {
    status: statusInstitutionEnum;
}
export interface FinancialInstitutionsResponse  {
    id: string;
    name: string;
    type: typeInstitutionEnum;
    status: statusInstitutionEnum;
    createdAt: Date;
}
export interface UpdateStatusInstitutionInterface {
    status: statusInstitutionEnum
}
