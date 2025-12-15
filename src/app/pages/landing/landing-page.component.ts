import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  AfterViewInit,
  inject,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Stat } from '../../types/stat.model';
import { LandingService } from '../../services/landing.service';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { PlanPreferenceService } from '../../services/plan-preference.service';
import { PlanType } from '../../services/account.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, AsyncPipe, NgClass, NgIf, StatCardComponent, ScrollRevealDirective],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent implements AfterViewInit {
  private readonly landingService = inject(LandingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly planPreferenceService = inject(PlanPreferenceService);

  private darkSectionTop = 0;
  private darkSectionBottom = 0;
  protected isOnDarkBackground = false;
  protected isCarouselClosed = false;
  protected billingPeriod: 'monthly' | 'yearly' = 'monthly';
  protected isMobileMenuOpen = false;

  stats$: Observable<Stat[]> = this.landingService.getStats();

  // FAQ
  protected faqItems = [
    {
      id: 1,
      question: 'Como funciona o AgendaAí?',
      answer: 'O AgendaAí é uma plataforma completa de agendamento online que permite que seus clientes marquem horários 24/7, de forma totalmente automatizada. Você configura seus horários disponíveis, serviços e profissionais, e o sistema gerencia tudo automaticamente, enviando lembretes e confirmações.',
      isOpen: false
    },
    {
      id: 2,
      question: 'Preciso de conhecimento técnico para usar?',
      answer: 'Não! O AgendaAí foi desenvolvido para ser extremamente simples. Você consegue configurar sua conta e começar a receber agendamentos em menos de 5 minutos, sem necessidade de código ou conhecimentos técnicos. Tudo é feito através de uma interface intuitiva e amigável.',
      isOpen: false
    },
    {
      id: 3,
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos todas as principais formas de pagamento: cartão de crédito, PIX e boleto bancário. Os pagamentos são processados de forma segura através de nossos parceiros certificados. Você também pode receber pagamentos diretamente dos clientes através do sistema.',
      isOpen: false
    },
    {
      id: 4,
      question: 'Posso usar o AgendaAí no celular?',
      answer: 'Sim! O AgendaAí possui aplicativos nativos para iOS e Android, além de ser totalmente responsivo no navegador. Você pode gerenciar seus agendamentos de qualquer lugar, a qualquer hora, tanto no computador quanto no celular ou tablet.',
      isOpen: false
    },
    {
      id: 5,
      question: 'Como funcionam as notificações automáticas?',
      answer: 'O sistema envia automaticamente lembretes por SMS e email para seus clientes antes dos agendamentos. Você pode configurar quando esses lembretes serão enviados (24h antes, 2h antes, etc.) e personalizar as mensagens. Isso reduz drasticamente as faltas e melhora a experiência do cliente.',
      isOpen: false
    },
    {
      id: 6,
      question: 'Posso personalizar com minha marca?',
      answer: 'Sim! Você pode conectar seu próprio domínio personalizado ou usar um subdomínio do AgendaAí. Além disso, é possível customizar as cores, adicionar seu logo e personalizar as mensagens para combinar com a identidade visual do seu negócio.',
      isOpen: false
    },
    {
      id: 7,
      question: 'O que acontece se eu cancelar minha assinatura?',
      answer: 'Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas de cancelamento. Após o cancelamento, você ainda terá acesso aos seus dados durante 30 dias para fazer backup. Não há contratos de longo prazo - total flexibilidade para você.',
      isOpen: false
    },
    {
      id: 8,
      question: 'Existe suporte técnico disponível?',
      answer: 'Sim! Oferecemos suporte 24/7 através de chat, email e telefone. Nossa equipe está sempre pronta para ajudar você com qualquer dúvida ou problema. Além disso, temos uma base de conhecimento completa com tutoriais e guias passo a passo.',
      isOpen: false
    }
  ];

  toggleFaq(id: number): void {
    const item = this.faqItems.find(faq => faq.id === id);
    if (item) {
      const wasOpen = item.isOpen;
      
      // Fecha todas as perguntas primeiro
      this.faqItems.forEach(faq => faq.isOpen = false);
      
      // Se a pergunta clicada estava fechada, abre ela
      // Se estava aberta, deixa fechada (comportamento de toggle)
      if (!wasOpen) {
        item.isOpen = true;
      }
      
      this.cdr.markForCheck();
    }
  }

  setBillingPeriod(period: 'monthly' | 'yearly'): void {
    this.billingPeriod = period;
    this.cdr.markForCheck();
  }

  getPlanPrice(basePrice: number): number {
    if (this.billingPeriod === 'yearly') {
      return basePrice * 0.8; // 20% de desconto
    }
    return basePrice;
  }

  /**
   * Função para voltar ao topo da página ao clicar no logo "Agendou"
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Navega para o fluxo de cadastro
   */
  goToSignup(): void {
    this.router.navigate(['/cadastro']);
  }

  /**
   * Quando o usuário seleciona um plano na landing page,
   * salva a preferência e redireciona para o cadastro
   */
  selectPlanFromLanding(planId: PlanType): void {
    if (planId) {
      this.planPreferenceService.setPreferredPlan(planId, 'landing');
      this.router.navigate(['/cadastro']);
    }
  }

  /**
   * Toggle do menu mobile
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.cdr.markForCheck();
  }

  /**
   * Scroll suave para uma seção específica
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    
    // Fecha o menu mobile se estiver aberto
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      this.cdr.markForCheck();
    }
  }

  ngAfterViewInit(): void {
    const darkSection = document.getElementById('pricing');
    if (darkSection) {
      const rect = darkSection.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset || 0;
      this.darkSectionTop = rect.top + scrollY;
      this.darkSectionBottom = this.darkSectionTop + rect.height;
    } else {
      this.darkSectionTop = 0;
      this.darkSectionBottom = 0;
    }
    this.updateHeaderTheme();
    this.updateCarouselState();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateHeaderTheme();
    this.updateCarouselState();
  }

  private updateHeaderTheme(): void {
    if (!this.darkSectionTop || !this.darkSectionBottom) {
      this.isOnDarkBackground = false;
      return;
    }

    const headerHeight = 80; // ~ h-20 (20 * 4px)
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const headerY = scrollY + headerHeight;

    this.isOnDarkBackground =
      headerY >= this.darkSectionTop && headerY <= this.darkSectionBottom;
  }

  private updateCarouselState(): void {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    
    // Fecha o carrossel quando o usuário começa a rolar (depois de ~50px de scroll)
    // Assim a animação acontece enquanto o carrossel ainda está visível
    const scrollThreshold = 50;
    const shouldClose = scrollY > scrollThreshold;
    
    if (this.isCarouselClosed !== shouldClose) {
      this.isCarouselClosed = shouldClose;
      this.cdr.markForCheck();
    }
  }
}


