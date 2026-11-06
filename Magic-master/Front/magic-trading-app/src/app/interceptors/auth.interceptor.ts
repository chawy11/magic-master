import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('token');
  if (!token || request.url.includes('api.scryfall.com')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
