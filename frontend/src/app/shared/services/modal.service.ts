import { Injectable, inject, Injector, Type, InjectionToken } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MODAL_DATA } from '../tokens/modal-data.token';

export interface ModalRef<TResult = unknown> {
  close: (result?: TResult) => void;
  afterClosed: () => Promise<TResult | undefined>;
}

export const MODAL_REF = new InjectionToken<ModalRef>('MODAL_REF');

@Injectable({ providedIn: 'root' })
export class ModalService {
  private overlay = inject(Overlay);
  private injector = inject(Injector);

  open<TComponent, TData = unknown, TResult = unknown>(
    component: Type<TComponent>,
    data?: TData,
  ): ModalRef<TResult> {
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      panelClass: ['flex', 'items-center', 'justify-center'],
      backdropClass: ['bg-black/50', 'backdrop-blur-sm'],
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    let resolveFn: (result?: TResult) => void;
    const afterClosedPromise = new Promise<TResult | undefined>((resolve) => {
      resolveFn = resolve;
    });

    const close = (result?: TResult) => {
      overlayRef.dispose();
      resolveFn(result);
    };

    overlayRef.backdropClick().subscribe(() => close());

    const injector = Injector.create({
      providers: [
        { provide: MODAL_DATA, useValue: data },
        { provide: MODAL_REF, useValue: { close, afterClosed: () => afterClosedPromise } }
      ],
      parent: this.injector,
    });

    const portal = new ComponentPortal(component, null, injector);
    overlayRef.attach(portal);

    return { close, afterClosed: () => afterClosedPromise };
  }
}