import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.guard';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [RouterModule, FormsModule],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService, private chatService: ChatService) {}

  async onLogin(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3000/login', {
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
        const data = await response.json();
        
        this.authService.setActiveUser(data.username);

      // ✅ Connexion au WebSocket après authentification
        this.chatService.connectToSocket(data.username);

        // Rediriger vers la page d'accueil ou une autre page
        this.router.navigate(['/home']);
      } 
      else {
        const errorData = await response.json();
        this.errorMessage = errorData.message || 'Erreur lors de la connexion.';
      }
    } catch (error) {
      this.errorMessage = 'Impossible de se connecter au serveur.';
    }
  }
}
