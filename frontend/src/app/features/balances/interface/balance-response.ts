export enum NameBalance {
    TOTAL = 'TOTAL',
    AVAILABLE = 'AVAILABLE',
    SAVINGS = 'SAVINGS',
    INVESTMENTS = 'INVESTMENTS',
    GOAL_SAVING = 'GOALSAVING',
}

export interface BalanceResponse {
    id: string;
    userId: string;
    nameBalance: NameBalance;
    balance: number | string;
    createdAt: string;
    updatedAt: string;
}