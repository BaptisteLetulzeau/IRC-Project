import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { io } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth.guard';

@Component({
  selector: 'app-public-chat',
  templateUrl: './public-chat.component.html',
  styleUrls: ['./public-chat.component.css'],
  imports: [FormsModule, CommonModule],
})
export class PublicChatComponent implements OnInit, OnDestroy {
  socket: any;
  connectedUsers: string[] = [];
  showUserList: boolean = false;
  command: string = '';
  message: string = '';
  messages: any[] = [];
  currentChannel: string = '';
  channelList: { name: string; description?: string; members?: [string] }[] = [{ name: '' }];
  filteredChannels: { name: string; description?: string }[] = [];
  joinedChannels: Set<string> = new Set();
  userList: { username: string }[] = [];
  private messageSubscription!: Subscription;
  private historySubscription!: Subscription;

  constructor(private chatService: ChatService, private http: HttpClient, private authService: AuthService) {
    this.filteredChannels = this.channelList;
    this.socket = io('http://localhost:3000');

    this.socket.on('new_message', (data: any) => {
      if (data.channel === this.currentChannel) {
        this.messages.push(data); // Ajoute le nouveau message si c'est le canal actuel
      }
    });
  }

  ngOnInit(): void {
    this.subscribeToMessages();
    this.subscribeToNicknameUpdates();
    this.chatService.joinChannel(this.currentChannel);
    //this.loadUsers();
    this.loadChannels();

    this.socket.on('connectedUsers', (users: string[]) => {
      this.connectedUsers = users;
    });

    this.currentChannel = this.filteredChannels[0].name;

    const username = this.authService.getActiveUserValue();
    this.socket.emit('join', username);
  }

  private loadChannels(): void {
    this.chatService
      .getChannels().subscribe(
        (channels: { name: string; description?: string; members?: [string] }[]) => {
            this.channelList = channels.map((channel) => ({
              name: channel.name,
              description: `Description du canal ${channel}`,
              members: channel.members
            }));
            this.filteredChannels = [...this.channelList];

          const username = this.authService.getActiveUserValue()|| '';

          if (this.currentChannel) {
            this.chatService.getHasJoined(this.currentChannel, username).subscribe(
              (hasJoined) => {
                if (hasJoined) {
                  this.currentChannel = this.channelList[0].name; 
                  this.chatService.joinChannel(this.currentChannel);
                  this.subscribeToMessages();
                  this.loadMessageHistory(this.currentChannel);
                } 
                else {
                  console.log(`L'utilisateur ${username} n'a pas rejoint le canal ${this.currentChannel}`);
                }
              },
              (error) => console.error("Erreur lors de la vérification de l'adhésion au canal :", error)
            );
          }
      })
  }

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

  sendMessage(): void {
    if (this.message.trim()) {
      const username = this.authService.getActiveUserValue();
      const msg = {
        user: username,
        text: this.message,
        channel: this.currentChannel,
      };

      this.socket.emit('send_message', msg);
      this.messages.push(msg);
      this.message = '';
    }
  }

  toggleUserList(): void {
    this.showUserList = !this.showUserList;

    // Si on affiche la liste, demander au serveur les utilisateurs connectés
    if (this.showUserList) {
      this.socket.emit('get_user_list', this.currentChannel);
    }
  }

  joinChannel(channelName: string) {
    this.chatService.joinChannel2(channelName).subscribe(
      (response) => {
      },
      (error) => {
        console.error('Erreur en rejoignant le canal :', error);
        alert(`Erreur : ${error.error.message}`);
      }
    );
    this.joinedChannels.add(channelName);
    this.loadChannels();
  }

  changeChannel(channel: { name: string }): void {
    if (channel.name !== this.currentChannel) {
      this.currentChannel = channel.name;
      this.messages = [];
      this.chatService.joinChannel(channel.name);
      this.subscribeToMessages();
      this.loadMessageHistory(this.currentChannel);

      this.socket.emit('join_channel', channel);
    }
  }

  quitChannel(channel: { name: string }): void {
    this.joinedChannels.delete(channel.name);

    this.chatService.leaveChannel(channel.name);
    this.messages = [];
    this.filteredChannels = this.filteredChannels.filter(
      (c) => c.name !== channel.name
    );

    if (this.filteredChannels.length > 0) {
      this.currentChannel = this.filteredChannels[0].name;
      this.chatService.joinChannel(this.currentChannel);
      this.subscribeToMessages();
      this.loadMessageHistory(this.currentChannel);
    } else {
      this.currentChannel = '';
    }
  }

  private subscribeToMessages(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    this.messageSubscription = this.chatService
      .listen('newMessage')
      .subscribe((message: any) => {
        this.messages.push(message);
      });
  }

  private subscribeToNicknameUpdates(): void {
    this.chatService
      .listen('nicknameUpdated')
      .subscribe((data: { username: string; nickname: string }) => {
        const user = this.userList.find((u) => u.username === data.username);
        if (user) {
          user.username = data.nickname; // Update the nickname locally
        }
      });
  }

  private loadMessageHistory(channelName: string): void {
    this.http
      .get<any[]>(`http://localhost:3000/channels/${channelName}/messages`)
      .subscribe(
        (history) => {
          this.messages = history;
        },
        (error) => {
          console.error(
            `Erreur lors du chargement des messages pour ${channelName}:`,
            error
          );
        }
      );
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.historySubscription) {
      this.historySubscription.unsubscribe();
    }
  }

  handleCommand(): void {
    if (this.command.startsWith('/channels')) {
      const searchString = this.command
        .replace('/channels', '')
        .trim()
        .toLowerCase();

      if (searchString) {
        this.filteredChannels = this.channelList.filter((channel) =>
          channel.name.toLowerCase().includes(searchString)
        );
      } else {
        // Si aucun texte n'est saisi, afficher tous les canaux
        this.filteredChannels = this.channelList;
      }

      // Réinitialiser la commande après traitement
      this.command = '';
    } else if (this.command.startsWith('/create')) {
      const channelName = this.command.replace('/create', '').trim();

      if (channelName) {
        const newChannel = {
          name: channelName,
          description: "Canal créé par l'utilisateur",
        };

        this.chatService.createChannel(newChannel).subscribe(
          () => {
            this.loadChannels();
          },
          (error) => {
            alert(
              `Erreur : ${
                error.error?.message || 'Impossible de créer le canal.'
              }`
            );
          }
        );
      } 
      else {
        alert(
          'Veuillez spécifier un nom pour le canal. Exemple : /create newChannel'
        );
      }

      this.command = '';
    } else if (this.command.startsWith('/delete')) {
      const channelName = this.command.replace('/delete', '').trim();

      if (channelName) {
        if (
          confirm(
            `Êtes-vous sûr de vouloir supprimer le canal "${channelName}" ?`
          )
        ) {
          this.chatService.deleteChannel(channelName).subscribe(
            () => {
              this.channelList = this.channelList.filter(
                (channel) => channel.name !== channelName
              ); // Filtrer le canal supprimé
              this.filteredChannels = this.channelList;
            },
            (error) => {
              alert(
                `Erreur lors de la suppression du canal: ${
                  error.error?.message || 'Impossible de supprimer le canal.'
                }`
              );
            }
          );
        }
      } else {
        alert(
          'Veuillez spécifier le nom du canal à supprimer. Exemple : /delete channelName'
        );
      }

      this.command = '';
    } else {
      alert('Commande inconnue.');
    }
  }
}
