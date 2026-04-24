import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'log',
    loadComponent: () => import('./log/log.page').then(m => m.LogPage)
  },
  {
    path: 'history',
    loadComponent: () => import('./history/history.page').then(m => m.HistoryPage)
  }
];