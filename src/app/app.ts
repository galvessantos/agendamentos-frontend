import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevHelperComponent } from './components/dev-helper/dev-helper.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DevHelperComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('AgendaAí');
}
