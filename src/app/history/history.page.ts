import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, getDocs, query, orderBy } from '@angular/fire/firestore';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonIcon, IonButton, IonButtons, IonBadge, IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barbellOutline, timeOutline, chevronBackOutline, calendarOutline, trophyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-history',
  standalone: true,
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonIcon, IonButton, IonButtons, IonBadge, IonSkeletonText
  ]
})
export class HistoryPage implements OnInit {
  groupedWorkouts: any[] = [];
  totalWorkouts: number = 0;
  isLoading: boolean = true;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    addIcons({ barbellOutline, timeOutline, chevronBackOutline, calendarOutline, trophyOutline });
  }

  ngOnInit() {
    this.loadWorkouts();
  }

  async loadWorkouts() {
    this.isLoading = true;
    try {
      const user = this.auth.currentUser;
      if (!user) return;

      const ref = collection(this.firestore, `users/${user.uid}/workouts`);
      const q = query(ref, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);

      const workouts = snapshot.docs.map(doc => doc.data());
      this.totalWorkouts = workouts.length;
      this.groupedWorkouts = this.groupByDay(workouts);

    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      this.isLoading = false;
    }
  }

  groupByDay(workouts: any[]) {
    const grouped: any = {};

    workouts.forEach(workout => {
      const date = workout.date?.seconds
        ? new Date(workout.date.seconds * 1000).toDateString()
        : new Date(workout.date).toDateString();

      if (!grouped[date]) grouped[date] = {};
      if (!grouped[date][workout.exercise]) grouped[date][workout.exercise] = [];
      grouped[date][workout.exercise].push(workout);
    });

    return Object.keys(grouped).map(date => ({
      date,
      exercises: Object.keys(grouped[date]).map(name => ({
        name,
        logs: grouped[date][name]
      }))
    }));
  }

  getProgress(logs: any[]) {
    if (logs.length < 2) return null;
    const current = logs[0];
    const previous = logs[1];
    return {
      reps: current.reps - previous.reps,
      weight: current.weight - previous.weight
    };
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}