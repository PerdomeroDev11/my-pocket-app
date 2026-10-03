import { Component, inject, OnInit, signal } from "@angular/core";
import { FinancialPageService } from "../financial-pages.service";
import { ActivatedRoute, Router } from "@angular/router";
import { financialPageResponseInterface } from "../interface/financial-page.model";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'app-list-financial-page',
    standalone: true,
    template: `
        <div class="inline-flex flex-col gap-1.5 min-w-60">
  <label for="page-select" class="text-xs font-semibold uppercase tracking-wider text-black-russian-400">
    Period
  </label>
  <div class="relative">
    <select
      id="page-select"
      (change)="onPageChange($event)"
      class="custom-select-arrow w-full appearance-none bg-black-russian-950/60 backdrop-blur-xl border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-sm font-medium text-black-russian-50 cursor-pointer transition-all duration-300 hover:border-white/30 hover:bg-black-russian-950/80 focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
    >
      @if (isLoading()) {
        <option class="bg-black-russian-950 text-black-russian-200">Loading...</option>
      } @else {
        @for (page of allPageOptions(); track page.id) {
          <option [value]="page.id" [selected]="page.id === financialPageId()" class="bg-black-russian-950 text-black-russian-50 py-2">
            {{page.name}} — {{page.status}}
          </option>
        }
      }
    </select>
  </div>
</div>
    `
})
export class ListFinancialPageComponent implements OnInit{
    private financialPageService = inject(FinancialPageService)
    private router = inject(Router)
    private route = inject(ActivatedRoute)

    isLoading = signal<boolean>(false)
    errMesagge = signal<string | null>(null)
    financialPageId = signal<string>('')
    allPageOptions = signal<financialPageResponseInterface[]>([])

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id')
            if (id) {
                this.financialPageId.set(id);
            }
        });
      this.listPagesOption();

        
    }
    onPageChange(event: Event) {
        const selectedId = (event.target as HTMLSelectElement).value;
        this.router.navigate(['/financial-pages', selectedId]);
    }

    listPagesOption(){
        this.getFinancialList()
    }
    private getFinancialList(){
      this.isLoading.set(true)
        this.financialPageService.getFiancianPages().subscribe({
            next: (response : financialPageResponseInterface[]) => {
              this.handleSuccess(response)
            },
            error: (err: HttpErrorResponse) => {
                this.handleError(err)
            }
        })
    }
    private handleSuccess(response: financialPageResponseInterface[]){
        this.isLoading.set(false)
        this.allPageOptions.set(response)
    }
    private handleError(err: HttpErrorResponse){
        this.isLoading.set(false)
        this.errMesagge.set(err.error?.message || 'Error fetching financial pages')
        console.error('ListFinancialPageComponent: error fetching financial pages:', err)
    }

}