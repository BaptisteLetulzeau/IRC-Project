import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.guard';
import { of } from 'rxjs';

// Créer un Mock pour Router
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('AuthService', () => {
  let guard: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useClass: MockRouter }
      ]
    });

    localStorage.clear();
    
    guard = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
