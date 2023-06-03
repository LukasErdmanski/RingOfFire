import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { GameComponent } from './game/game.component';

const routes: Routes = [
  { path: '', component: StartScreenComponent },
  /* Mit : wird eine Variable in der Route gekennzeichnet, in diesem Fall die game id und diese follgt nach dem Route-Part game mit '/' */
  { path: 'game/:id', component: GameComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
