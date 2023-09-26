import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { GameComponent } from './game/game.component';
import { PlayerComponent } from './player/player.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/* Angular Material from
https://material.angular.io/components/button/api  
https://material.angular.io/components/icon/api
https://material.angular.io/components/dialog/api
*/
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogAddPlayerComponent } from './dialog-add-player/dialog-add-player.component';
/* Erforderliche Module bzgl. Style, Forms, Inputfelder für Dialog Fenster, 
damit diese HTML-Elemente/tages in 'dialog-add-player.component.html' wie 
<div mat-dialog-content>, <mat-form-field>, <mat-label>, <input matInput>, <div mat-dialog-actions> etc.
überhaupt ohne Fehler funktionieren */
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { GameInfoComponent } from './game-info/game-info.component';

import { MatCardModule } from '@angular/material/card';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { PlayerContainerComponent } from './player-container/player-container.component';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { EditPlayerComponent } from './edit-player/edit-player.component';
import { RotateDeviceInfoComponent } from './rotate-device-info/rotate-device-info.component';
import { GameOverScreenComponent } from './game-over-screen/game-over-screen.component';
import { FlagsContainerComponent } from './flags-container/flags-container.component';
// Required for ngx-translate
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { GameService } from './services/game.service';

// Required for ngx-translate
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    StartScreenComponent,
    GameComponent,
    PlayerComponent,
    DialogAddPlayerComponent,
    GameInfoComponent,
    PlayerContainerComponent,
    EditPlayerComponent,
    RotateDeviceInfoComponent,
    GameOverScreenComponent,
    FlagsContainerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    MatInputModule,
    MatCardModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    // Required for ngx-translate
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    // no need to place any providers due to the `providedIn` flag in GameSerivce
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
