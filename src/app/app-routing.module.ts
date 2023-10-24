import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartScreenComponent } from './components/start-screen/start-screen.component';
import { GameOverScreenComponent } from './components/game-over-screen/game-over-screen.component';
import { GameComponent } from './components/game/game.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
    /**
     * When the path is completely empty (base URL), redirect to the 'start' route.
     * The 'pathMatch: full' ensures that the entire URL path needs to be empty to match this route.
     */
    { path: '', redirectTo: 'start', pathMatch: 'full' },
    { path: 'start', title: 'Start Screen', component: StartScreenComponent },
    { path: 'start', title: 'Start Screen', component: StartScreenComponent },
    /**
     * With ":", a variable in the route is denoted. In this case, it's the game ID,
     * which follows the "game" route part with a "/".
     */
    { path: 'game/:id', title: 'Game Screen', component: GameComponent },
    { path: 'game-over-screen', title: 'Game Over Screen', component: GameOverScreenComponent },
    { path: '**', title: 'Page Not Found', component: NotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}