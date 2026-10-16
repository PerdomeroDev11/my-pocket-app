import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { BalancesServices } from "../../balances.service";
import { BalanceResponse, NameBalance } from "../../interface/balance-response";
import { HttpErrorResponse } from "@angular/common/http";
import { Subscription } from "rxjs";
import { CurrencyPipe } from "@angular/common";
import { CurrencyUserComponent } from "../../../users/components/user/currency-user.component";

@Component({
    selector: 'app-balance-saving',
    imports: [CurrencyPipe,CurrencyUserComponent],
    template: `
        <div class="h-full w-full">
            @if (isLoading()) {
                <div class="flex items-center justify-between gap-3">
                    <div class="h-3 w-24 animate-pulse rounded-full bg-white/20"></div>
                    <div class="h-7 w-20 animate-pulse rounded-xl bg-white/10"></div>
                </div>
            }

            @if (!isLoading() && !SavingBalance()) {
                <div class="flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-white/70">
                    No hay balances disponibles.
                </div>
            }

            @if (SavingBalance(); as balance) {
                <div class="flex h-full flex-col justify-between gap-3">
                    <div class="flex items-end justify-between gap-3">
                        <div class="flex flex-col justify-end">
                            <p class="text-[28px] font-bold leading-none tracking-tight text-sky-400">{{ balance.balance  | currency:'$ '}}</p>
                            <span class="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55"><app-currency-user/></span>
                        </div>
                        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-400/20">
                            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M10 2a1 1 0 0 1 1 1v9.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L9 12.586V3a1 1 0 0 1 1-1Z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="flex items-center justify-between gap-3 border-t border-white/10 pt-2">
                        <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                            {{ balance.nameBalance }}
                        </span>
                        <span class="rounded-full border border-sky-400/20 bg-sky-500/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-sky-300">saving</span>
                    </div>
                </div>
            }
        </div>
    `,
})
export class BalanceSavingComponent implements OnInit, OnDestroy {
    private readonly balanceService = inject(BalancesServices);
    private readonly refreshSubscription = new Subscription();

    readonly isLoading = signal(false);
    readonly SavingBalance = signal<BalanceResponse | null>(null);
    readonly currencyUser = signal<string | null>(null)

    ngOnInit(): void {
        this.getBalances();
        this.refreshSubscription.add(
            this.balanceService.balanceRefresh$.subscribe(() => {
                this.getBalances();
            }),
        );

    }

    ngOnDestroy(): void {
        this.refreshSubscription.unsubscribe();
    }

    private getBalances(): void {
        this.isLoading.set(true);

        this.balanceService.getAllBalance().subscribe({
            next: (response: BalanceResponse[]) => {
                const available = (response ?? []).find(
                    (balance) => balance.nameBalance === NameBalance.SAVINGS,
                ) ?? null;
                this.SavingBalance.set(available);
                this.isLoading.set(false);
            },
            error: (err: HttpErrorResponse) => {
                this.isLoading.set(false);
                console.error('error to load balances:', err);
            },
        });
    }
}