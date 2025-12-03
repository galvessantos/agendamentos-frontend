import { Component, signal } from '@angular/core';
import { LandingPageComponent } from './pages/landing/landing-page.component';

@Component({
  selector: 'app-root',
  imports: [LandingPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('AgendaAí');
}
