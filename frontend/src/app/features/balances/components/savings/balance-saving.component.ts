import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { BalancesServices } from "../../balances.service";
import { BalanceResponse, NameBalance } from "../../interface/balance-response";
import { HttpErrorResponse } from "@angular/common/http";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-balance-saving',
    template: `
        <div class="w-full max-w-sm rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-[0_12px_30px_rgba(16,185,129,0.12)] ring-1 ring-white/60">
            @if (isLoading()) {
                <div class="flex items-center justify-between gap-3">
                    <div class="h-3 w-24 animate-pulse rounded-full bg-emerald-200"></div>
                    <div class="h-7 w-20 animate-pulse rounded-xl bg-emerald-100"></div>
                </div>
            }

            @if (!isLoading() && !SavingBalance()) {
                <div class="flex items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-6 text-sm text-emerald-700">
                    No hay balances disponibles.
                </div>
            }

            @if (SavingBalance(); as balance) {
                <div class="space-y-3">
                    

                    <div class="flex items-end justify-between gap-3">
                        <p class="text-3xl font-bold tracking-tight text-slate-800">{{ balance.balance }}</p>
                        <div class="rounded-xl bg-emerald-500/10 p-2 text-blue-600">
                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M10 2a1 1 0 0 1 1 1v9.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L9 12.586V3a1 1 0 0 1 1-1Z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                        <span class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
                            {{ balance.nameBalance }}
                        </span>
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