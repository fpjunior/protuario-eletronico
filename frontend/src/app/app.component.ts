import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  irParaMenuPrincipal() {
    this.router.navigate(['/']);
  }
  title = 'frontend';
  currentUser: any;

  constructor(public authService: AuthService, private router: Router) {
    this.currentUser = this.authService.user;
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  isLoginRoute(): boolean {
    return this.router.url === '/login';
  }

  logout() {
    this.authService.logout();
  }
}
