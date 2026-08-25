import { Component, signal, output, input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="w-full rounded-[28px] border border-cyan-500/15 bg-slate-900/80 p-5 shadow-[0_20px_50px_rgba(8,15,30,0.5)] backdrop-blur-sm sm:p-6">
      <div class="mb-5 text-left">
        <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Security</p>
        <h3 class="mt-2 text-xl font-semibold tracking-tight text-cyan-50 sm:text-2xl">Verify your code</h3>
        <p class="mt-2 text-sm text-slate-300">Enter the 6-digit code sent to your device.</p>
      </div>

      <div class="flex justify-center gap-2.5 sm:gap-3" aria-label="Verification code">
        @for (index of [0, 1, 2, 3, 4, 5]; track index) {
          <input
            [attr.aria-label]="'Verification digit ' + (index + 1)"
            type="text"
            inputmode="numeric"
            maxlength="1"
            [value]="digits()[index]"
            (input)="onDigitInput(index, $event)"
            (keydown)="onKeyDown(index, $event)"
            (paste)="onPaste($event)"
            class="h-12 w-11 rounded-xl border border-slate-700 bg-slate-950 text-center text-lg font-bold tracking-[0.2em] text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-all duration-200 hover:border-cyan-400/60 focus:border-cyan-400 focus:bg-slate-950 focus:ring-4 focus:ring-cyan-500/15 sm:h-14 sm:w-12"
          />
        }
      </div>

      @if (control.touched && control.invalid) {
        <p class="mt-4 text-center text-xs font-medium text-red-300">Enter the 6-digit verification code.</p>
      }

      <div class="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-slate-700/80 bg-slate-950/40 px-3 py-2.5">
        <p class="text-[11px] text-slate-400">Need a new code?</p>
        <button
          type="button"
          (click)="onResend()"
          [disabled]="coolDown() > 0"
          class="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-[11px] font-semibold text-cyan-200 transition-all hover:border-cyan-400/60 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
        >
          @if (coolDown() > 0) {
            Resend in {{ coolDown() }}s
          } @else {
            Resend code
          }
        </button>
      </div>
    </div>
  `,
})
export class VerifyCodeComponent {
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  label = input('Verification code');
  codeChange = output<string>();
  resendCode = output<void>();
  coolDown = signal(0);
  private timeInterval: any;

  digits = signal<string[]>(Array(6).fill(''));

  control = new FormControl('', {
    validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
  });

  onDigitInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);

    const nextDigits = [...this.digits()];
    nextDigits[index] = value;
    this.digits.set(nextDigits);

    if (value && index < 5) {
      const nextInput = input.parentElement?.children[index + 1] as HTMLInputElement | undefined;
      nextInput?.focus();
    }

    this.syncControlValue();
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !target.value && index > 0) {
      const previousInput = (target.parentElement?.children[index - 1] as HTMLInputElement | undefined);
      previousInput?.focus();
      previousInput?.select();
      const nextDigits = [...this.digits()];
      nextDigits[index - 1] = '';
      this.digits.set(nextDigits);
      this.syncControlValue();
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      (target.parentElement?.children[index - 1] as HTMLInputElement | undefined)?.focus();
    }

    if (event.key === 'ArrowRight' && index < 5) {
      (target.parentElement?.children[index + 1] as HTMLInputElement | undefined)?.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6);

    if (!pasted) {
      return;
    }

    const nextDigits = Array(6).fill('');
    pasted.split('').forEach((digit, index) => {
      nextDigits[index] = digit;
    });

    this.digits.set(nextDigits);
    this.syncControlValue();

    const nextFocus = (event.target as HTMLInputElement).parentElement?.children[Math.min(pasted.length, 5)] as HTMLInputElement | undefined;
    nextFocus?.focus();
  }

  private syncControlValue() {
    const value = this.digits().join('');
    this.control.setValue(value, { emitEvent: false });
    this.codeChange.emit(value);
  }

  onResend() {
    if (this.coolDown() > 0) {
      return;
    }

    this.resendCode.emit();
    this.startCoolDown(60);
  }

  startCoolDown(seconds: number) {
    this.coolDown.set(seconds);
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    this.timeInterval = setInterval(() => {
      const current = this.coolDown();
      if (current <= 1) {
        clearInterval(this.timeInterval);
        this.coolDown.set(0);
      } else {
        this.coolDown.set(current - 1);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
}