import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app/components/app/app.component";
import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { FormsModule } from '@angular/forms'; 
import { LoginComponent } from "./app/components/login/login.component";
import { ChatComponent } from './app/components/chat/chat.component';
import { PrivateChatComponent } from "./app/components/private-chat/private-chat.component";
import { PublicChatComponent } from "./app/components/public-chat/public-chat.component";

@NgModule({
    // Il faut déclarer tous les components ici
    declarations: [
        PrivateChatComponent,
        PublicChatComponent,
        AppComponent,
        LoginComponent,
        ChatComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }