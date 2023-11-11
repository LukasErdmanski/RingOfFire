import { Injectable, inject } from '@angular/core';
import { CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, Firestore, Transaction, addDoc, collection, deleteDoc, doc, docData, runTransaction, updateDoc } from '@angular/fire/firestore';
import { Observable, catchError, map, tap } from 'rxjs';
import { Game } from 'src/models/game';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class FirebaseService {
    private heroesUrl = 'api/heroes';

    /**
     * Firestore instance with specific settings related to the Firebase account and database.
     * Used for CRUD operations within this service.
     */
    private firestore: Firestore = inject(Firestore);

    constructor(private http: HttpClient) {}

    getHero(id: string): Observable<Game> {
        const url = `${this.heroesUrl}/${id}}`;
        return this.http.get<Game>(url).pipe(
            tap((_) => this.log(`fetched hero id=${id}`)),
            // The optonal parameter result of the handleError() method is undefined in this case.
            catchError(this.handleError<Game>(`getHero id=${id}`))
        );
    }

    getGame(id: string): Observable<Game> {
        return this.getGameDocData(id).pipe(
            tap((_) => this.log(`fetched game id=${id}`)),
            // The optonal parameter result of the handleError() method is undefined in this case.
            catchError(this.handleError<Game>(`getHGame id=${id}`))
        );
    }

    /**
     * Returns the game document data as an observable.
     * @param id - The game id.
     * @returns An observable of the game data.
     */
    public getGameDocData(id: string): Observable<Game> {
        try {
            const gameDocRef = this.getGameDocRef(id);
            /**
             * It is not known if 'gameDocData' from Firebase DB has properties like
             * game.players, game.stack, etc. To address this in strict mode, type as
             * 'any' or assign a specific data type, e.g., Game.
             */
            return docData(gameDocRef).pipe(map((gameDocData: DocumentData) => gameDocData as Game));
        } catch (error) {
            console.error('Error getting game document data:', error);
            throw error;
        }
    }

    /**
     * Returns the single game document reference based on the game ID.
     * @param id - The game id.
     * @returns The game document reference.
     */
    private getGameDocRef(id: string): DocumentReference<DocumentData> {
        try {
            const gameColRef = this.getGameColRef();
            return doc(gameColRef, id);
        } catch (error) {
            console.error('Error getting game document reference:', error);
            throw error;
        }
    }

    /**
     * Returns the game collection reference.
     * @returns The game collection reference.
     */
    private getGameColRef(): CollectionReference<DocumentData> {
        try {
            return collection(this.firestore, 'games');
        } catch (error) {
            console.error('Error getting game collection reference:', error);
            throw error;
        }
    }

    private handleError<T>(operation = 'operation', result?: T): (error: any) => Observable<T> {
        return (error: any): Observable<T> => {
            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead;

            // TODO: better job of transforming error for user consumption
            this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as T); // Cast `result` to `T` to maintain the Observable<T> type.
        };
    }

    /** Log a HeroService message with the MessageService */
    private log(message: string) {
        // this.messageService.add(`HeroService: ${message}`);
    }
}
