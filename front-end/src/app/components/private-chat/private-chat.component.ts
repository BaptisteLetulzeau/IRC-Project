import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.guard';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.css'],
  imports: [FormsModule, CommonModule],
})
export class PrivateChatComponent implements OnInit, OnDestroy {
  message: string = '';
  privateMessages: { sender: string; recipient: string; text: string }[] = [];
  userList: { username: string }[] = [];
  selectedUser: string | null = null;
  private messageSubscription!: Subscription;

  constructor(private chatService: ChatService, private authService: AuthService) {}

  ngOnInit(): void {
    //this.loadUsers(); // Charger la liste des utilisateurs disponibles
    this.listenToPrivateMessages();
    this.loadMessageHistory();
  }

  // Charger la liste des utilisateurs disponibles
  private loadUsers(): void {
    this.chatService.getUsers().subscribe(
      (users) => {
        this.userList = users;
      },
      (error) => {
        console.error('Erreur lors du chargement des utilisateurs :', error);
      }
    );
  }

  // Charger l'historique des messages privés entre l'utilisateur actuel et le destinataire sélectionné
  private loadMessageHistory(): void {
    const currentUser = this.authService.getActiveUserValue() ?? 'Anonyme';
    if (this.selectedUser) {
      this.chatService.getPrivateMessages(currentUser, this.selectedUser).subscribe(
        (messages) => {
          this.privateMessages = messages.map((msg) => {
            return {
              ...msg,
              sender: msg.sender,
              recipient: msg.receiver,
              text: msg.message
            };
          });
        },
        (error) => {
          console.error('Erreur lors du chargement des messages privés :', error);
        }
      );
    }
  }

  // Sélectionner un utilisateur pour voir les messages privés avec cet utilisateur
  selectUser(user: string): void {
    this.selectedUser = user; // Mettre à jour l'utilisateur sélectionné
    this.privateMessages = []; // Réinitialiser les messages

    this.loadMessageHistory();
  }

  // Envoyer un message privé
  sendMessage(): void {
    if (this.message.trim() && this.selectedUser) {
      const sender = this.authService.getActiveUserValue() ?? 'Anonyme';
      const newMessage = {
        sender,
        recipient: this.selectedUser,
        text: this.message,
      };

      // Ajouter le message localement avant de l'envoyer au serveur
      this.privateMessages.push(newMessage);

      this.chatService.sendPrivateMessage(newMessage).subscribe(
        () => {
          console.log('Message envoyé au serveur avec succès.');
        },
        (error) => {
          console.error('Erreur lors de l\'envoi du message :', error);
        }
      );
      this.message = ''; // Réinitialiser le champ de message
    }
  }

  // Écouter les nouveaux messages privés en temps réel
  private listenToPrivateMessages(): void {
    this.messageSubscription = this.chatService
      .listen('privateMessage')
      .subscribe((message: any) => {
        // Ajouter un message uniquement si l'utilisateur actuel est le destinataire
        if (message.recipient === this.authService.getActiveUserValue()) {
          this.privateMessages.push(message);
        }
      });
  }

  // Méthode pour vérifier si un message vient de l'utilisateur actuel
  isCurrentUser(sender: string): boolean {
    return sender === this.authService.getActiveUserValue();
  }

  // Méthode pour nettoyer la souscription lors de la destruction du composant
  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
