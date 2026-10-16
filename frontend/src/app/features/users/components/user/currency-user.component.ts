import { Component, inject, OnInit, Signal, signal } from "@angular/core";
import { UserService } from "../../user.service";
import { UserResponse } from "../../interfaces/user.model";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'app-currency-user',
    template: `
    <p>{{currencyUserData()}}</p>
    `
})
export class CurrencyUserComponent implements OnInit{
    private usersService = inject(UserService)

    currencyUserData = signal<string | null>(null)

    ngOnInit(): void {
        this.currencyUser()
    }
    currencyUser(){
        this.getCurrencyUser()
    }
    private getCurrencyUser(){
        this.usersService.infoUser().subscribe({
            next: (response: UserResponse) =>{
                const currency = response.currency
                this.currencyUserData.set(currency)
            },
            error: (err: HttpErrorResponse)=> {
                console.error('error currency user: ' ,err)
            }
        })
    }
}