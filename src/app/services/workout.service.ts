import { Injectable } from '@angular/core';
import { Workout, Exercise, Set } from '../types/workout.types';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private readonly STORAGE_KEY = 'workouts';

  constructor() { }

  getWorkouts(): Workout[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const workouts = JSON.parse(stored);
      return workouts.map((w: any) => ({
        ...w,
        date: new Date(w.date)
      }));
    }
    return [];
  }

  saveWorkout(workout: Workout): void {
    const workouts = this.getWorkouts();
    workouts.push(workout);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workouts));
  }

  deleteWorkout(workoutId: string): void {
    const workouts = this.getWorkouts().filter(w => w.id !== workoutId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workouts));
  }

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}