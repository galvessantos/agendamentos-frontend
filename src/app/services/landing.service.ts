import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LANDING_STATS } from '../data/landing.data';
import { Stat } from '../types/stat.model';

@Injectable({
  providedIn: 'root',
})
export class LandingService {
  // No futuro, este método pode chamar a API real.
  getStats(): Observable<Stat[]> {
    return of(LANDING_STATS);
  }
}


