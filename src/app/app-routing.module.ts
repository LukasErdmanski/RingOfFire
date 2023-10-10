import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartScreenComponent } from './start-screen/start-screen.component';

import { GameOverScreenComponent } from './game-over-screen/game-over-screen.component';
import { GameComponent } from './game/game.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
    { path: '', redirectTo: '/start', pathMatch: 'full' },
    { path: 'start', title: 'Start Screen', component: StartScreenComponent },
    /* Mit : wird eine Variable in der Route gekennzeichnet, in diesem Fall die game id und diese follgt nach dem Route-Part game mit '/' */
    { path: 'game/:id', title: 'Game Screen', component: GameComponent },
    {
        path: 'game-over-screen',
        title: 'Game Over Screen', component: GameOverScreenComponent,
        data: {
            initialDelayGameOverStartBtn: false,
        },
    },
    { path: '**', title: 'Page Not Found', component: NotFoundComponent },
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
