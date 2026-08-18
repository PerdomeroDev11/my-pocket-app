
export interface PasswordStrength{
    score: number,
    label: 'Very Weak' | 'Weak' | 'Acceptable' | 'Strong' | 'very Strong' ,
    checks: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecialChar: boolean
    }
}

export function checkPasswordStrong(password: string) : PasswordStrength{
    const checks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[^A-Za-z0-9]/.test(password)
    }

    const score = Object.values(checks).filter(Boolean).length - 1 ;
    const labels: PasswordStrength['label'][] = ['Very Weak' , 'Weak' , 'Acceptable' , 'Strong' , 'very Strong']

    return{
        score: Math.max(0,score),
        label: labels[Math.max(0, Math.min(score , 4))],
        checks,
    }
}