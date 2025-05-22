import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule]
})
export class AppComponent {
  title = 'IRC Project';

  constructor(private router: Router) {}

  onLogout(event: Event): void {
    event.preventDefault();

    localStorage.clear();

    this.router.navigate(['/login']);
  }
}
