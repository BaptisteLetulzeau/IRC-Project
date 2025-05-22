import { Component } from '@angular/core';
import { PrivateChatComponent } from '../private-chat/private-chat.component';
import { PublicChatComponent } from '../public-chat/public-chat.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  styleUrls: ['./chat.component.css'],
  templateUrl: './chat.component.html',
  imports: [PublicChatComponent, PrivateChatComponent, CommonModule],
})
export class ChatComponent {
  activeTab: 'public' | 'private' = 'public';

  switchTab(tab: 'public' | 'private') {
    this.activeTab = tab;
  }
}
