import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  imports: [RouterModule, FormsModule, CommonModule],
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  async onRegister(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });

      if (response.ok) {
        this.router.navigate(['/login']);
      }
       else {
        const errorData = await response.json();
        this.errorMessage =
          errorData.message || "Erreur lors de l'inscription.";
        alert(response.statusText);
      }
    }
     catch (error) {
      this.errorMessage = 'Impossible de se connecter au serveur.';
    }
  }
}
