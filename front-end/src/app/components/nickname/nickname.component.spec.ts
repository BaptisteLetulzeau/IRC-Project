import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NicknameComponent } from './nickname.component';

describe('NicknameComponent', () => {
  let component: NicknameComponent;
  let fixture: ComponentFixture<NicknameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NicknameComponent,HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NicknameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
