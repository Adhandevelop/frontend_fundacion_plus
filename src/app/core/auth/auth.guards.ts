import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export const accountGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ensureUser().pipe(
    map(user => {
      if (!user) return router.createUrlTree(['/login'], {queryParams: {returnUrl: state.url}});
      if (user.estado !== 'activo' || (route.data['requiresAdmin'] && !auth.canAdmin())) return router.createUrlTree(['/acceso-denegado']);
      return true;
    }),
    catchError(() => of(router.createUrlTree(['/login'], {queryParams: {returnUrl: state.url, sessionError: '1'}}))),
  );
};
