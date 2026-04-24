import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, barbellOutline, trendingUpOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonIcon
  ]
})
export class HomePage implements OnInit {
  userEmail: string = '';

  constructor(private auth: Auth, private router: Router) {
    addIcons({logOutOutline,barbellOutline,timeOutline,trendingUpOutline});
  }

  ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.userEmail = user.email || '';
    }
  }

  goToLog() {
    this.router.navigate(['/log']);
  }

  goToHistory() {
  this.router.navigate(['/history']);
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}