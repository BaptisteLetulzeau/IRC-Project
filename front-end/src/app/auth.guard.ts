import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private activeUser = new BehaviorSubject<string | null>(null);

  setActiveUser(username: string): void {
    this.activeUser.next(username);
  }

  getActiveUser(): Observable<string | null> {
    return this.activeUser.asObservable();
  }

  getActiveUserValue(): string {
    return this.activeUser.value ?? 'Anonyme';
  }
}
