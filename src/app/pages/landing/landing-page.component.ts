import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { Stat } from '../../types/stat.model';
import { LandingService } from '../../services/landing.service';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, AsyncPipe, StatCardComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  private readonly landingService = inject(LandingService);

  stats$: Observable<Stat[]> = this.landingService.getStats();
}


