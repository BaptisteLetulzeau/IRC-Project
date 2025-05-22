import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController  } from '@angular/common/http/testing'; 
import { ChatService } from './chat.service';
import { AppComponent } from '../components/app/app.component';
import { of } from 'rxjs'; 
import { ActivatedRoute } from '@angular/router';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { 
          provide: ActivatedRoute, 
          useValue: { params: of({}) }
        }
      ],
    });
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it("✅ Devrait être créé", () => {
    expect(service).toBeTruthy();
  });

  it("✅ Devrait récupérer la liste des canaux", () => {
    const dummyChannels = [
      { name: "Channel 1", description: "Test 1" },
      { name: "Channel 2", description: "Test 2" },
    ];

    service.getChannels().subscribe((channels) => {
      expect(channels.length).toBe(2);
      expect(channels).toEqual(dummyChannels);
    });

    const req = httpMock.expectOne("http://localhost:3000/channels");
    expect(req.request.method).toBe("GET");
    req.flush(dummyChannels);
  });
});
