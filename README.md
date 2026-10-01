# WorkoutTracker

A mobile workout logging app built with Ionic, Angular and Capacitor. Users sign in, search for an exercise, log sets, reps and weight, and view their logged workouts grouped by day.

| | Version (package.json) |
| --- | --- |
| Angular | ^20.0.0 |
| Ionic Angular | ^8.0.0 |
| Capacitor Core | 8.3.0 |
| AngularFire | ^20.0.1 |

External services: Firebase Authentication, Cloud Firestore, ExerciseDB API.

## Features

- Email/password sign up and sign in
- Exercise search showing name, body part, equipment and an image
- Log sets, reps, weight and notes for an exercise
- History of logged workouts grouped by day, newest first, with a total count
- Reps and weight difference between the two most recent logs of the same exercise on the same day

## Scripts

```bash
npm install      # install dependencies
npm start        # ng serve
npm run build    # ng build
npm test         # ng test (Karma + Jasmine)
npm run lint     # ng lint
```

Firebase configuration is in `src/environments/environment.ts`.

## API reference

### Authentication

`LoginPage` and `HomePage` use `@angular/fire/auth`.

| Operation | Function | On success | On failure |
| --- | --- | --- | --- |
| Sign in | `signInWithEmailAndPassword(auth, email, password)` | Navigates to `/home` | `alert(error.message)` |
| Register | `createUserWithEmailAndPassword(auth, email, password)` | Navigates to `/home` | `alert(error.message)` |
| Sign out | `signOut(auth)` | Navigates to `/login` | No error handling |

`LoginPage.toggleMode()` switches the form between sign in and register. `LogPage` and `HistoryPage` read the user from `auth.currentUser`.

### Workout data (Firestore)

Workouts are stored in the collection `users/{uid}/workouts`, one document per saved log. The app creates and reads documents.

#### Create a workout log

`LogPage.saveWorkout()`

```typescript
const workoutsRef = collection(this.firestore, `users/${user.uid}/workouts`);
await addDoc(workoutsRef, { ... });
```

Checks before saving:

| Check | If it fails |
| --- | --- |
| An exercise is selected, `sets > 0` and `reps > 0` | Toast: "Please select an exercise and fill in sets and reps!" |
| `auth.currentUser` is not null | Toast: "User not logged in" |

Document written:

```json
{
  "exercise": "<selected exercise name>",
  "bodyPart": "<from ExerciseDB>",
  "equipment": "<from ExerciseDB>",
  "sets": 3,
  "reps": 8,
  "weight": 60,
  "notes": "<free text>",
  "date": "<serverTimestamp()>"
}
```

On success: toast "Workout saved 💪" and the form is cleared.
On error: toast with `error.message`, or "Error saving workout".

#### Read workout history

`HistoryPage.loadWorkouts()` runs on `ngOnInit`.

```typescript
const ref = collection(this.firestore, `users/${user.uid}/workouts`);
const q = query(ref, orderBy('date', 'desc'));
const snapshot = await getDocs(q);
```

All documents in the collection are fetched in one query. The page then:

- `groupByDay(workouts)` groups logs by `Date.toDateString()`, then by `exercise`, and returns `[{ date, exercises: [{ name, logs }] }]`
- `getProgress(logs)` returns `{ reps, weight }` as `logs[0]` minus `logs[1]`, or `null` when there are fewer than 2 logs
- `totalWorkouts` is the number of documents returned

### Exercise search (ExerciseDB)

`LogPage.searchExercises(event)` is called from the search bar (debounce 300 ms). It only sends a request when the query has 2 or more characters.

```http
GET https://oss.exercisedb.dev/api/v1/exercises?name={query}&limit=10
```

| Parameter | Value |
| --- | --- |
| `name` | Search bar text |
| `limit` | `10` |

The response is used as-is if it is an array, otherwise `data.data` is used. When an exercise is selected, the page reads:

| Field used | Read from |
| --- | --- |
| Name | `name` |
| Body part | `bodyPart`, else `bodyParts` |
| Equipment | `equipment`, else `equipments` |
| Image | `gifUrl` |

On error: `console.error('Exercise search error', err)` and the result list is cleared.

## Data model

Fields written to each document in `users/{uid}/workouts`:

| Field | Value |
| --- | --- |
| `exercise` | Selected exercise name |
| `bodyPart` | ExerciseDB `bodyPart` or `bodyParts`, or `''` |
| `equipment` | ExerciseDB `equipment` or `equipments`, or `''` |
| `sets` | `Number(sets)` |
| `reps` | `Number(reps)` |
| `weight` | `Number(weight)`, shown in History as kg |
| `notes` | Text input |
| `date` | `serverTimestamp()` |

`gifUrl` is displayed on the Log page but is not saved.

## Error handling

| Situation | Behaviour |
| --- | --- |
| Sign in or register fails | `alert(error.message)` |
| Save without exercise, sets or reps | Toast, nothing saved |
| Save while `auth.currentUser` is null | Toast "User not logged in" |
| Firestore write fails | Toast with the error message |
| ExerciseDB request fails | Logged to console, results cleared |
| Loading history fails | `console.error('Error loading workouts:', error)` |
| History opened while `auth.currentUser` is null | Returns without loading |

## Current limitations

- Workout logs cannot be edited or deleted.
- Routes have no guards.
- Firestore security rules are not included in this repository.
- `src/environments/environment.prod.ts` does not contain `firebaseConfig`.
- `src/app/services/workout.service.ts` (localStorage-based) is not imported by any page. It imports `../types/workout.types`, which is not in the repository.
