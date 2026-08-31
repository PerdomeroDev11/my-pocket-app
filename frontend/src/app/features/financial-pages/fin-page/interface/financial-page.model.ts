export enum StatusPageEnum {
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED'
}


export interface CreateFinancialPageInterface {
    name: string
    previusPageId?: string
}

export interface financialPageResponseInterface {
    id: string
    name: string
    startDate: Date
    endDate: Date | null
    status: string | null
    totalIncome: number | null
    total: number | null
    closedAt: Date | null
    createdAt: Date
    userId:string
}
export interface LastPageResponseIdInterfaces{
    id: string
}
export interface StatusPagesInerface {
    status: StatusPageEnum
}