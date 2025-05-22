import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.guard';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private authService: AuthService) {
    this.socket = io(this.apiUrl);
  }

  connectToSocket(username: string): void {
    this.socket.emit('join', username);

    this.socket.on('connect', () => {
      console.log(`✅ Connecté au WebSocket avec l'ID : ${this.socket.id}`);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Déconnecté du WebSocket');
    });
  }

  listen(eventName: string): Observable<any> {
    return new Observable((observer) => {
      const eventHandler = (data: any) => observer.next(data);

      this.socket.on(eventName, eventHandler);

      return () => {
        this.socket.off(eventName, eventHandler);
      };
    });
  }

  sendMessage(message: string, channel: string): void {
    // Envoi du message et du canal au serveur
    this.socket.emit('send_message', { user: 'username', text: message, channel: channel });
  }

  onNewMessage(callback: (message: string) => void): void {
    this.socket.on('new_message', callback);
  }

  getPrivateMessages(sender: string, receiver: string) {
    return this.http.get<any[]>(`${this.apiUrl}/private-messages/${sender}/${receiver}`);
  }

  sendPrivateMessage(message: {
    sender: string;
    recipient: string;
    text: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/private-messages`, message);
  }

  listenToPrivateMessages(): Observable<{ sender: string; text: string }> {
    return new Observable((observer) => {
      this.socket.on('privateMessage', (message) => {
        observer.next(message);
      });

      return () => {
        this.socket.off('privateMessage');
      };
    });
  }

  getUsers(): Observable<any> {
    const activeUserId = this.authService.getActiveUserValue();
    return this.http.get(`${this.apiUrl}/users?activeUserId=${activeUserId}`);
  }

  joinChannel(channelName: string): void {
    this.socket.emit('joinChannel', channelName);
  }

  joinChannel2(channelName: string): Observable<any> {
    const activeUserId = this.authService.getActiveUserValue();
    return this.http.post(`${this.apiUrl}/channels/join`, { channelName , activeUserId});
  }

  getHasJoined(channelName: string, activeUserId: string): Observable<boolean> {
    return this.http.get<{ hasJoined: boolean }>(`${this.apiUrl}/channels/hasJoined`, {
      params: { channelName, activeUserId }
    }).pipe(
      map(response => response.hasJoined)
    );
  }

  leaveChannel(channel: string): void {
    this.socket.emit('leaveChannel', { channelName: channel });
  }

  getChannelMembers(username: string | null) {
    return this.http.get<string[]>(`http://localhost:3000/channel-members/${username}`);
  }

  getUserChannels(username: string): Observable<{ name: string }[]> {
    return this.http.get<{ name: string }[]>(`${this.apiUrl}/user-channels/${username}`);
  }

  // getChannels(): Observable<{ name: string; description?: string }[]> {
  //   const activeUserId = this.authService.getActiveUserId();
  //   return this.http.get<{ name: string; description?: string }[]>(`${this.apiUrl}/channels?activeUserId=${activeUserId}`);
  // }

  getChannels(): Observable<{ name: string; description?: string }[]> {
    return this.http.get<{ name: string; description?: string }[]>(`${this.apiUrl}/channels`);
  }

  createChannel(channel: { name: string; description?: string }) {
    return this.http.post<{ message: string; channel: any }>(`${this.apiUrl}/create`, channel);
  }

  updateNickname(nickname: string, username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/nick`, { nickname, username });
  }

  deleteChannel(channelName: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/channels/${channelName}`);
  }
}
