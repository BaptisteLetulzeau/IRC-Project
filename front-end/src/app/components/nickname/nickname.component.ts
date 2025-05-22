import { Component,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../auth.guard';

@Component({
  selector: 'app-nickname',
  imports: [FormsModule, RouterModule],
  standalone: true,
  styleUrl: './nickname.component.css',
  template: `
  <div class="modify-username">
    <h2>Modifier votre pseudo</h2>

    <form (submit)="updateNickname()">
      <div>
        <label for="nickname">Nouveau pseudo :</label>
        <input 
          id="nickname" 
          [(ngModel)]="nickname" 
          name="nickname" 
          placeholder="Entrez votre nouveau pseudo..." 
          class="input-field"
          required 
        />
      </div>
      <button type="submit" class="submit-btn">Modifier</button>
    </form>
  </div>
  `
})
export class NicknameComponent {
  nickname: string = '';

  constructor(private chatService: ChatService, private authService: AuthService) {}

  updateNickname(): void {
    const username = this.authService.getActiveUserValue();

    if (!username) {
      alert('Erreur : Utilisateur non connecté.');
      return;
    }

    this.chatService.updateNickname(this.nickname, username).subscribe(
      (response) => {
        alert(response.message);
        localStorage.setItem('username', this.nickname);
      },
      (error) => {
        alert(
          error.error?.message || 'Erreur lors de la mise à jour du pseudo.'
        );
      }
    );
  }
}
