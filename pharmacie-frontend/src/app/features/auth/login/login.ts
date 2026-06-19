import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule,
              InputTextModule, PasswordModule, MessageModule],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class LoginComponent {

    email = '';
    password = '';
    errorMessage = '';
    isLoading = false;

    constructor(private authService: AuthService, private router: Router) {}

    login(): void {
        this.errorMessage = '';
        this.isLoading = true;

        this.authService.login({ email: this.email, password: this.password })
            .subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigate(['/dashboard']);
                },
                error: () => {
                    this.isLoading = false;
                    this.errorMessage = 'Email ou mot de passe incorrect';
                }
            });
    }
}
