import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonSearchbar, IonList, IonItem, IonLabel, IonInput, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import { barbellOutline, saveOutline, trashOutline, chevronBackOutline } from 'ionicons/icons';
import { serverTimestamp } from 'firebase/firestore';
import { Toast } from '@capacitor/toast';

@Component({
  selector: 'app-log',
  templateUrl: './log.page.html',
  styleUrls: ['./log.page.scss'],
  standalone: true,
  imports: [IonButtons, CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, FormsModule, IonButton, IonSearchbar, IonList, IonItem, IonLabel, IonInput, IonIcon]
})

export class LogPage {
  searchQuery: string = '';
  exercises: any[] = [];

  selectedExercise: string = '';
  bodyPart: string = '';
  equipment: string = '';
  gifUrl: string = '';

  sets: number = 0;
  reps: number = 0;
  weight: number = 0;
  notes: string = '';

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
  ) { 
    addIcons({chevronBackOutline,saveOutline,trashOutline,barbellOutline});
  }

  searchExercises(event: any) {
    const query = event.target.value;
 
    if (!query || query.length < 2) {
      this.exercises = [];
      return;
    }

    this.http.get<any>(`https://oss.exercisedb.dev/api/v1/exercises?name=${query}&limit=10`).subscribe(data => {
      this.exercises = Array.isArray(data) ? data : data.data || [];
    }, err => {
      console.error('Exercise search error', err);
      this.exercises = [];
    });
  }

  selectExercise(exercise:any) {
    this.selectedExercise = exercise.name;
    this.bodyPart = exercise.bodyPart || exercise.bodyParts || '';
    this.equipment= exercise.equipment || exercise.equipments || '';
    this.gifUrl = exercise.gifUrl || '';
    this.searchQuery = exercise.name;
    this.exercises = [];
  }

  clearForm() {
    this.searchQuery = '';
    this.selectedExercise = '';
    this.bodyPart = '';
    this.equipment = '';
    this.gifUrl = '';
    this.sets = 0;
    this.reps = 0;
    this.weight = 0;
    this.notes = '';
    this.exercises = [];
  }

  async saveWorkout() {
  if (!this.selectedExercise || this.sets <= 0 || this.reps <=0) {
    await Toast.show({
      text: 'Please select an exercise and fill in sets and reps!',
      duration: 'short',
      position: 'bottom'
    });
    return;
  }

  try {
    const user = this.auth.currentUser;

    if (!user) {
      await Toast.show({
        text: 'User not logged in',
        duration: 'short',
        position: 'bottom'
      });
      return;
    }

    const workoutsRef = collection(
      this.firestore,
      `users/${user.uid}/workouts`
    );

    await addDoc(workoutsRef, {
      exercise: this.selectedExercise,
      bodyPart: this.bodyPart,
      equipment: this.equipment,
      sets: Number(this.sets),
      reps: Number(this.reps),
      weight: Number(this.weight),
      notes: this.notes,
      date: serverTimestamp()
    });

    await Toast.show({
      text: 'Workout saved 💪',
      duration: 'short',
      position: 'bottom'
    });

    this.clearForm();

  } catch (error: any) {
    await Toast.show({
      text: error.message || 'Error saving workout',
      duration: 'short',
      position: 'bottom'
    });
  }
}
 goBack() {
    this.router.navigate(['/home']);
  }
}
