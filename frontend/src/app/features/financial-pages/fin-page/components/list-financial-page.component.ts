import { Component, inject, OnInit, signal } from "@angular/core";
import { FinancialPageService } from "../financial-pages.service";
import { ActivatedRoute, Router } from "@angular/router";
import { financialPageResponseInterface } from "../interface/financial-page.model";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-list-financial-page',
  standalone: true,
  template: `
    <div class="w-full min-w-0">
      <button
        type="button"
        (click)="toggle()"
        [attr.aria-expanded]="open()"
        class="group flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-[13px] font-medium uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline-none"
      >
        <div class="flex items-center gap-2.5">
          <img
            src="/pages-icon.svg"
            alt="Pages icon"
            class="h-4.5 w-4.5 shrink-0 opacity-80"
          />
          <span class="text-[13px]">Pages</span>
        </div>
        <svg
          class="h-3.5 w-3.5 transition-transform duration-200"
          [class.-rotate-90]="!open()"
          viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
        >
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06Z" clip-rule="evenodd"/>
        </svg>
      </button>

      @if (open()) {
        <ul class="mt-0.5 max-h-64 space-y-0.5 overflow-y-auto ">
          @if (isLoading()) {
            <li class="px-3 py-1.5 text-sm text-slate-500">Loading...</li>
          } @else if (errMesagge()) {
            <li class="px-3 py-1.5 text-sm text-red-400">{{ errMesagge() }}</li>
          } @else if (allPageOptions().length === 0) {
            <li class="px-3 py-1.5 text-sm text-slate-500">No pages yet</li>
          } @else {
            @for (page of allPageOptions(); track page.id) {
              <li class=" ">
                <button
                  type="button"
                  (click)="pick(page)"
                  class="flex w-full items-center gap-2.5 truncate rounded-lg border-l border-transparent px-3.5 py-2 text-left text-[14px] transition-all duration-200 hover:border-l-blue-400/80 hover:bg-white/5 focus-visible:border-l-blue-400/80 focus-visible:bg-white/5 focus-visible:outline-none"
                  [class.text-slate-100]="page.id === financialPageId()"
                  [class.bg-white/10]="page.id === financialPageId()"
                  [class.text-slate-400]="page.id !== financialPageId()"
                >
                  <img
                    src="/pages-icon.svg"
                    alt="Page icon"
                    class="h-4 w-4 shrink-0 rounded-none border-0 bg-transparent p-0 opacity-80"
                  />
                  <span class="truncate">{{ page.name }}</span>
                </button>
              </li>
            }
          }
        </ul>
      }
    </div>
  `
})
export class ListFinancialPageComponent implements OnInit {
  private financialPageService = inject(FinancialPageService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  isLoading = signal<boolean>(false)
  errMesagge = signal<string | null>(null)
  financialPageId = signal<string>('')
  allPageOptions = signal<financialPageResponseInterface[]>([])
  open = signal<boolean>(true)

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id')
      if (id) this.financialPageId.set(id)
    })
    this.listPagesOption()
  }

  toggle() { this.open.update(o => !o) }

  pick(page: financialPageResponseInterface) {
    this.financialPageId.set(page.id)
    this.router.navigate(['/financial-pages', page.id])
  }

  listPagesOption() {
    this.getFinancialList()
  }
  private getFinancialList() {
    this.isLoading.set(true)
    this.financialPageService.getFiancianPages().subscribe({
      next: (response: financialPageResponseInterface[]) => this.handleSuccess(response),
      error: (err: HttpErrorResponse) => this.handleError(err)
    })
  }
  private handleSuccess(response: financialPageResponseInterface[]) {
    this.isLoading.set(false)
    this.allPageOptions.set(response)
  }
  private handleError(err: HttpErrorResponse) {
    this.isLoading.set(false)
    this.errMesagge.set(err.error?.message || 'Error fetching financial pages')
    console.error('ListFinancialPageComponent: error fetching financial pages:', err)
  }
}