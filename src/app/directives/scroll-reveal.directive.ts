import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private observer?: IntersectionObserver;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const el = this.elementRef.nativeElement;

    // Estado inicial: levemente deslocado e invisível
    el.classList.add(
      'opacity-0',
      'translate-y-6',
      'transition-all',
      'duration-700',
      'ease-out'
    );

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.remove('opacity-0', 'translate-y-6');
            el.classList.add('opacity-100', 'translate-y-0', 'scroll-revealed');
            this.observer?.unobserve(el);
          }
        });
      },
      {
        threshold: 0.15
      }
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}


