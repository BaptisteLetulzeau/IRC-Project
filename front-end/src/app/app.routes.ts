import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './components/app/app.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ChatComponent } from './components/chat/chat.component';
import { NicknameComponent } from './components/nickname/nickname.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'home', component: ChatComponent }, 
    { path: 'login', component: LoginComponent }, 
    { path: 'signup', component: SignupComponent },
    { path: 'nick', component: NicknameComponent }
];
