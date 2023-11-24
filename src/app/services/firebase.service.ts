import { Injectable, inject } from '@angular/core';
import { CollectionReference, DocumentData, DocumentReference, Firestore, addDoc, collection, deleteDoc, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Observable, isObservable, map, tap } from 'rxjs';
import { IGame } from '../interfaces/game';

@Injectable({
    providedIn: 'root',
})
export class FirebaseService {
    private gameCollection = 'games';

    /**
     * Firestore instance with specific settings related to the Firebase account and database.
     * Used for CRUD operations within this service.
     */
    private firestore: Firestore = inject(Firestore);

    constructor() {}

    public gameId!: string;

    public async createGame(game: IGame): Promise<void> {
        try {
            const colRef = this.getGameColRef();
            const docRef = await addDoc(colRef, game);
            console.log(`created game id=${docRef.id}`);
            console.log(`created game id=${docRef.id}`);

            this.gameId = docRef.id;
        } catch (error) {
            this.handleError<DocumentReference>('createGame');
        }
    }

    //TODO: Change method name later to getGame
    public readGame<Data>(id: string): Observable<IGame> {
        try {
            const docRef = this.getGameDocRef(id);
            return docData(docRef).pipe(
                /**
                 * Uses `map` to return the game document data, which is either the
                 * IGame object or `undefined`.
                 */
                map((gameDocData: DocumentData) => gameDocData as IGame),
                // Uses `tap` for logging the result without affecting the stream.
                tap((mappedGameDocData) => {
                    const outcome = mappedGameDocData ? 'fetched' : 'did not find';
                    // Logs the result of the operation.
                    console.log(`${outcome} game id=${mappedGameDocData.id}`);
                    this.log(`${outcome} game id=${mappedGameDocData.id}`);
                })
            );
        } catch (error) {
            return this.handleError<Observable<IGame>>('readGame')(error);
        }
    }

    public async updateGame(game: IGame): Promise<void> {
        try {
            const docRef = this.getGameDocRef(game.id);
            const plainGame = this.convertGameToPlainObject(game);
            await updateDoc(docRef, plainGame);
            console.log(`updated game id=${game.id}`);
        } catch (error) {
            this.handleError<void>('updateGame');
        }
    }

    public async deleteGame(id: string): Promise<void> {
        try {
            const docRef = this.getGameDocRef(id);
            await deleteDoc(docRef);
            console.log(`deleted game id=${id}`);
        } catch (error) {
            this.handleError<void>('deleteGame');
        }
    }

    //#region HELPERS
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
            return collection(this.firestore, this.gameCollection);
        } catch (error) {
            console.error('Error getting game collection reference:', error);
            throw error;
        }
    }

    /**
     * Using {...game} in TypeScript and JavaScript creates a shallow copy of the object, meaning all
     * properties of the original object are copied into a new object. This new object has the same
     * structure and values but is a separate instance.
     *
     * The reason why {...game} works in functions like updateDoc from Firebase, while
     * directly passing the game object may cause errors, lies in the typing and expectations of these
     * functions.
     *
     * 1. Typing and TypeScript: TypeScript is very strict with types and interfaces. If a function expects
     *    a specific type that doesn't exactly match the passed object, an error is triggered. This can
     *    occur if the function expects a form of objects different from your interface's structure.
     *
     * 2. Index Signature: The error 'Index signature for type '${string}.${string}' is missing in type
     *    'IGame'' suggests updateDoc expects an object with an index signature, absent in IGame. An index
     *    signature in TypeScript allows an object to have dynamic keys.
     *
     * 3. Shallow Copy with Spread Operator: Using {...game} creates a shallow copy without the strict
     *    typings of the original class or interface. This leads to the function accepting the data as a
     *    general object, not a strictly typed one.
     *
     * 4. Direct Firebase Document Structure: By using {...game}, we ensure that the game's properties are
     *    directly set at the first level of the Firebase document. This approach avoids nesting the game
     *    data under a specific key, aligning with updateDoc's expectations for direct property updates.
     *
     * In summary: Directly passing a strictly typed object can lead to type conflicts, especially if the
     * receiving function expects a more flexible or different structure. Using {...game} circumvents this
     * problem by creating an unstrictly typed copy of the object that is accepted by the function.
     */
    convertGameToPlainObject(game: IGame): { [key: string]: any } {
        return { ...game };
    }

    /**
     * Handles errors in CRUD operations.
     *
     * @param operation - The name of the operation that failed.
     * @param result - The result of the operation, which may be undefined.
     * @returns A function that processes errors and returns an appropriate result.
     *
     * This method is designed to handle errors in CRUD operations, including those that return
     * Observables, Promises, or other types. It ensures that the application remains stable
     * and can continue running in the event of errors.
     *
     * - If `result` is `undefined`, it returns `null as T;` to maintain stability.
     * - If `result` is an Observable and `undefined`, it returns `undefined as T;`.
     * - For all other cases, it returns `result as T;`.
     */
    private handleError<T>(operation = 'operation', result?: T): (error: any) => T {
        return (error: any): T => {
            // TODO: send the error to remote logging infrastructure
            console.error(error);

            // TODO: better job of transforming error for user consumption
            this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            if (result == undefined && isObservable(result)) undefined as T;
            if (result == undefined) return null as T;

            return result;
        };
    }

    /** Log a FirebaseService message with the MessageService */
    private log(message: string) {
        // this.messageService.add(`FirebaseService: ${message}`);
    }
    //#endregion HELPERS
}
