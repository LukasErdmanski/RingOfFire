import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartScreenComponent } from './start-screen/start-screen.component';

import { GameOverScreenComponent } from './game-over-screen/game-over-screen.component';
import { GameComponent } from './game/game.component';

const routes: Routes = [
    { path: '', redirectTo: '/start', pathMatch: 'full' },
    { path: 'start', component: StartScreenComponent },
    /* Mit : wird eine Variable in der Route gekennzeichnet, in diesem Fall die game id und diese follgt nach dem Route-Part game mit '/' */
    { path: 'game/:id', component: GameComponent },
    {
        path: 'game-over-screen',
        component: GameOverScreenComponent,
        data: {
            initialDelayGameOverStartBtn: false,
        },
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            bindToComponentInputs: true, // <-- enable this feature to share data via routing
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
