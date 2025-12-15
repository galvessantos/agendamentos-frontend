import { Routes } from '@angular/router';
import { LandingPageComponent } from '../pages/landing/landing-page.component';
import { SignupPageComponent } from '../pages/signup/signup-page.component';
import { BusinessAreaPageComponent } from '../pages/signup/business-area-page.component';
import { ConfiguracoesPageComponent } from '../pages/signup/configuracoes-page.component';
import { QuickSetupPageComponent } from '../pages/signup/quick-setup-page.component';
import { DashboardPageComponent } from '../pages/dashboard/dashboard-page.component';
import { PaymentPageComponent } from '../pages/payment/payment-page.component';
import { AgendaPageComponent } from '../pages/agenda/agenda-page.component';
import { ClientesPageComponent } from '../pages/clientes/clientes-page.component';
import { ServicosPageComponent } from '../pages/servicos/servicos-page.component';
import { FuncionariosPageComponent } from '../pages/funcionarios/funcionarios-page.component';
import { CaixaPageComponent } from '../pages/caixa/caixa-page.component';
import { PerfilPageComponent } from '../pages/perfil/perfil-page.component';
import { PlanosPageComponent as PlanosAtivarPageComponent } from '../pages/planos/planos-page.component';
import { PublicPageComponent } from '../pages/public/public-page.component';

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
    path: 'cadastro/configuracoes',
    component: ConfiguracoesPageComponent,
  },
  {
    path: 'dashboard',
    component: DashboardPageComponent,
  },
  {
    path: 'agenda',
    component: AgendaPageComponent,
  },
  {
    path: 'clientes',
    component: ClientesPageComponent,
  },
  {
    path: 'servicos',
    component: ServicosPageComponent,
  },
  {
    path: 'funcionarios',
    component: FuncionariosPageComponent,
  },
  {
    path: 'caixa',
    component: CaixaPageComponent,
  },
  {
    path: 'perfil',
    component: PerfilPageComponent,
  },
  {
    path: 'planos',
    component: PlanosAtivarPageComponent,
  },
  {
    path: 'pagamento',
    component: PaymentPageComponent,
  },
  {
    path: ':establishmentSlug',
    component: PublicPageComponent,
  },
];

