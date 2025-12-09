import { Routes } from '@angular/router';
import { LandingPageComponent } from '../pages/landing/landing-page.component';
import { SignupPageComponent } from '../pages/signup/signup-page.component';
import { BusinessAreaPageComponent } from '../pages/signup/business-area-page.component';
import { QuickSetupPageComponent } from '../pages/signup/quick-setup-page.component';
import { DashboardPageComponent } from '../pages/dashboard/dashboard-page.component';
import { PlansPageComponent } from '../pages/signup/plans-page.component';
import { PaymentPageComponent } from '../pages/payment/payment-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'cadastro',
    component: SignupPageComponent,
  },
  {
    path: 'cadastro/area-atuacao',
    component: BusinessAreaPageComponent,
  },
  {
    path: 'cadastro/configuracao-inicial',
    component: QuickSetupPageComponent,
  },
  {
    path: 'dashboard',
    component: DashboardPageComponent,
  },
  {
    path: 'planos',
    component: PlansPageComponent,
  },
  {
    path: 'pagamento',
    component: PaymentPageComponent,
  },
];

