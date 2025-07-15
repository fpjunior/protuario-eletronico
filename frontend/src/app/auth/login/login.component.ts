import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;

  // Forgot password properties
  showForgotPasswordForm = false;
  forgotPasswordLoading = false;
  forgotPasswordError = '';
  forgotPasswordSuccess = false;
  forgotPasswordSuccessMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Se já estiver autenticado, redirecionar
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 401) {
          this.errorMessage = 'Email ou senha inválidos.';
        } else if (error.status === 500) {
          this.errorMessage = 'Erro interno do servidor. Tente novamente.';
        } else {
          this.errorMessage = 'Erro de conexão. Verifique sua internet.';
        }
      }
    });
  }

  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email é obrigatório';
    }
    if (emailControl?.hasError('email')) {
      return 'Email inválido';
    }
    return '';
  }

  getSenhaErrorMessage(): string {
    const senhaControl = this.loginForm.get('senha');
    if (senhaControl?.hasError('required')) {
      return 'Senha é obrigatória';
    }
    if (senhaControl?.hasError('minlength')) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    return '';
  }

  getForgotEmailErrorMessage(): string {
    const emailControl = this.forgotPasswordForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'E-mail é obrigatório';
    }
    if (emailControl?.hasError('email')) {
      return 'Digite um e-mail válido';
    }
    return '';
  }

  toggleForgotPassword(): void {
    this.showForgotPasswordForm = !this.showForgotPasswordForm;
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = false;
    this.errorMessage = '';

    if (this.showForgotPasswordForm) {
      // Pré-preencher o email se já foi digitado no login
      const loginEmail = this.loginForm.get('email')?.value;
      if (loginEmail && this.loginForm.get('email')?.valid) {
        this.forgotPasswordForm.patchValue({ email: loginEmail });
      }
    }
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.forgotPasswordLoading = true;
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = false;

    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.forgotPasswordLoading = false;
        this.forgotPasswordSuccess = true;
        this.forgotPasswordSuccessMessage = response.message ||
          'As instruções para recuperação de senha foram enviadas para seu e-mail.';

        // Após 5 segundos, voltar para o login
        setTimeout(() => {
          this.toggleForgotPassword();
        }, 5000);
      },
      error: (error) => {
        this.forgotPasswordLoading = false;
        this.forgotPasswordError = error.error?.message ||
          'Erro ao enviar e-mail de recuperação. Tente novamente.';
      }
    });
  }

  showForgotPassword(): void {
    // Método mantido para compatibilidade com testes existentes
    this.toggleForgotPassword();
  }
}
