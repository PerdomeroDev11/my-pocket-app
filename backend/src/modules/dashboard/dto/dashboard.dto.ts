import { IsDateString } from 'class-validator'

export class DatesDashboardDto{
    @IsDateString()
    startDate!:  string
    @IsDateString()
    endDate!: string
}