import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';
import { canAccessAdminSection } from './admin-access.policy';

export const accountGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ensureUser().pipe(
    map(user => {
      if (!user) return router.createUrlTree(['/login'], {queryParams: {returnUrl: state.url}});
      // Child guards must also enforce the portal requirement declared on their ancestors.
      const ancestors = route.pathFromRoot ?? [route];
      const requiresAdmin = ancestors.some(parent => parent.data['requiresAdmin']);
      const requiresCitizen = ancestors.some(parent => parent.data['requiresCitizen']);
      if (user.estado !== 'activo' || (requiresAdmin && !auth.canAdmin()) || (requiresCitizen && !auth.canCitizen())) return router.createUrlTree(['/acceso-denegado']);
      if (ancestors.some(parent => parent.data['adminSection'] !== undefined && !canAccessAdminSection(user, parent.data['adminSection']))) return router.createUrlTree(['/acceso-denegado']);
      return true;
    }),
    catchError(() => of(router.createUrlTree(['/login'], {queryParams: {returnUrl: state.url, sessionError: '1'}}))),
  );
};
