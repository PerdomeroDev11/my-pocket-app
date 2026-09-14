import { Component, inject, OnInit, signal } from "@angular/core";
import { FinancialPageService } from "../financial-pages.service";
import { ActivatedRoute, Router } from "@angular/router";
import { financialPageResponseInterface } from "../interface/financial-page.model";

@Component({
    selector: 'app-list-financial-page',
    standalone: true,
    template: `
        <div class="inline-flex flex-col gap-1 min-w-[220px]">
      <label for="page-select" class="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Period
      </label>
      <select
        id="page-select"
        (change)="onPageChange($event)"
        class="appearance-none bg-white bg-[url('data:image/svg+xml;utf8,<svg_xmlns=%27http://www.w3.org/2000/svg%27_width=%2712%27_height=%278%27_viewBox=%270_0_12_8%27_fill=%27none%27><path_d=%27M1_1.5L6_6.5L11_1.5%27_stroke=%27%23374151%27_stroke-width=%271.5%27_stroke-linecap=%27round%27_stroke-linejoin=%27round%27/></svg>')] bg-no-repeat bg-[right_14px_center] border border-gray-300 rounded-lg px-3.5 py-2.5 pr-10 text-sm font-medium text-gray-900 cursor-pointer transition-colors hover:border-gray-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        @if (isLoading()) {
          <option>Loading...</option>
        } @else {
          @for (page of allPageOptions(); track page.id) {
            <option [value]="page.id" [selected]="page.id === financialPageId()">
              <span>{{page.name}}</span><span>{{page.status}}</span>
            </option>
          }
        }
      </select>
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
        this.isLoading.set(true)
        this.financialPageService.getFiancianPages().subscribe({
            next: (response : financialPageResponseInterface[]) => {
                this.isLoading.set(false)
                this.allPageOptions.set(response)
            },
            error: (err) => {
                this.isLoading.set(false)
                this.errMesagge.set(err.error?.message || 'error to get list pages')
            }
        })
    }

}