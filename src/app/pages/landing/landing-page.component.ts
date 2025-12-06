import { AsyncPipe, NgClass } from '@angular/common';
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
import { Observable } from 'rxjs';
import { Stat } from '../../types/stat.model';
import { LandingService } from '../../services/landing.service';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, AsyncPipe, NgClass, StatCardComponent, ScrollRevealDirective],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent implements AfterViewInit {
  private readonly landingService = inject(LandingService);
  private readonly cdr = inject(ChangeDetectorRef);

  private darkSectionTop = 0;
  private darkSectionBottom = 0;
  protected isOnDarkBackground = false;
  protected isCarouselClosed = false;

  stats$: Observable<Stat[]> = this.landingService.getStats();

  /**
   * Função para voltar ao topo da página ao clicar no logo "Agendou"
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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


