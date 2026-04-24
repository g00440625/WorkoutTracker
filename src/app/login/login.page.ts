import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { IonContent, IonHeader, IonTitle, IonToolbar,  IonItem, IonLabel, IonInput, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonLabel, IonInput, IonButton]
})
export class LoginPage {
  email = '';
  password = '';
  isLogin = true;
  
  constructor(private router: Router, private auth: Auth) { }

  toggleMode() {
    this.isLogin = !this.isLogin;
  }

  async submit() {
    try {
      if (this.isLogin) {
        await signInWithEmailAndPassword(this.auth, this.email, this.password);
      } else {
        await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      }
      this.router.navigate(['/home']);
    } catch (error: any) {
      alert(error.message);
    }
  }

}
