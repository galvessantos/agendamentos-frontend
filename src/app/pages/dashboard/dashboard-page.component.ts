import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent {
  showTour = signal(true);
  showPlanAlert = signal(true);

  constructor(private router: Router) {}

  closeTour() {
    this.showTour.set(false);
  }

  closePlanAlert() {
    this.showPlanAlert.set(false);
  }

  goToPlans() {
    this.router.navigate(['/planos']);
  }
}



