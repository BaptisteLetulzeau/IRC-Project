import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PrivateChatComponent } from './private-chat.component';

describe('PrivateChatComponent', () => {
  let component: PrivateChatComponent;
  let fixture: ComponentFixture<PrivateChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateChatComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
