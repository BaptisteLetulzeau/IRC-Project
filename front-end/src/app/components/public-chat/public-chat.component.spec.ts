import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PublicChatComponent } from './public-chat.component';

describe('PublicChatComponent', () => {
  let component: PublicChatComponent;
  let fixture: ComponentFixture<PublicChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicChatComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send a message', () => {
    component.message = 'Test message';
    component.sendMessage();
    expect(component.messages.length).toBe(1);
    expect(component.messages[0].text).toBe('Test message');
  });

  it('should change channel', () => {
    const newChannel = { name: 'NewChannel' };
    component.changeChannel(newChannel);
    expect(component.currentChannel).toBe('NewChannel');
  });

  it('should quit a channel', () => {
    component.joinedChannels.add('General');
    component.quitChannel({ name: 'General' });
    expect(component.joinedChannels.has('General')).toBeFalse();
  });

  it('should toggle user list', () => {
    expect(component.showUserList).toBeFalse();
    component.toggleUserList();
    expect(component.showUserList).toBeTrue();
  });
});
