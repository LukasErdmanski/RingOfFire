import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Required for Angular Fire / Firebase.
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

// Custom components.
import { RotateDeviceInfoComponent } from './components/rotate-device-info/rotate-device-info.component';
import { StartScreenComponent } from './components/start-screen/start-screen.component';
import { GameOverScreenComponent } from './components/game-over-screen/game-over-screen.component';
import { GameComponent } from './components/game/game.component';
import { PlayerContainerComponent } from './components/player-container/player-container.component';
import { PlayerComponent } from './components/player/player.component';
import { GameInfoComponent } from './components/game-info/game-info.component';
import { DialogAddPlayerComponent } from './components/dialog-add-player/dialog-add-player.component';
import { DialogEditPlayerComponent } from './components/dialog-edit-player/dialog-edit-player.component';
import { DialogIncludeLastGamePlayersComponent } from './components/dialog-include-last-game-players/dialog-include-last-game-players.component';
import { DialogJoinGameComponent } from './components/dialog-join-game/dialog-join-game.component';
import { FlagsContainerComponent } from './components/flags-container/flags-container.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

/**
 * Angular Material modules sourced from:
 * - https://material.angular.io/components/button/api
 * - https://material.angular.io/components/icon/api
 * - https://material.angular.io/components/dialog/api
 */
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
/**
 * Required modules related to style, forms, and input fields for dialog windows.
 * This ensures that HTML elements/tags in 'dialog-add-edit-player.component.html' such as
 * <div mat-dialog-content>, <mat-form-field>, <mat-label>, <input matInput>,
 * <div mat-dialog-actions>, etc. function without errors.
 */
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

// Required for ngx-translate
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DOCUMENT } from '@angular/common';

/**
 * Factory function for the TranslateLoader.
 * This function creates a new instance of TranslateHttpLoader.
 * The loader will try to load translations using HttpClient.
 *
 * Here, we are dynamically determining the path to load translations based on the base href in the document.
 * This ensures that the translations path works both in local development and when deployed.
 *
 * @param http HttpClient instance to make network requests.
 * @param document An abstraction over the DOM document provided by Angular.
 * @returns An instance of TranslateHttpLoader.
 */
export function HttpLoaderFactory(http: HttpClient, document: any) {
    // Getting the base URL from the document or defaulting to the current directory.
    const baseHref = document.baseURI || './';
    // Using the base URL to create the full path for loading translations.
    return new TranslateHttpLoader(http, `${baseHref}assets/i18n/`, '.json');
}

@NgModule({
    declarations: [AppComponent, RotateDeviceInfoComponent, StartScreenComponent, GameOverScreenComponent, GameComponent, PlayerContainerComponent, PlayerComponent, GameInfoComponent, DialogAddPlayerComponent, DialogEditPlayerComponent, DialogIncludeLastGamePlayersComponent, DialogJoinGameComponent, FlagsContainerComponent, NotFoundComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        // Required for Firebase.
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
        provideDatabase(() => getDatabase()),
        provideFirestore(() => getFirestore()),
        provideStorage(() => getStorage()),
        // Required for Angular Material
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        FormsModule,
        MatInputModule,
        MatCardModule,
        ReactiveFormsModule,
        // Required for ngx-translate.
        HttpClientModule,
        TranslateModule.forRoot({
            defaultLanguage: 'en',
            loader: {
                provide: TranslateLoader,
                // Specifying the factory function for the loader.
                useFactory: HttpLoaderFactory,
                // Specifying the dependencies required for the HttpLoaderFactory.
                // We need both HttpClient for network requests and DOCUMENT to get the base href.
                deps: [HttpClient, DOCUMENT],
            },
        }),
    ],
    providers: [
        // No need to place any providers due to the `providedIn` flag in GameSerivce.
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
