import { Component } from '@angular/core';
/* Erforderlich laut Angular Dialog Doku für 'onNoClick()' Methode. */
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-player',
  templateUrl: './dialog-add-player.component.html',
  styleUrls: ['./dialog-add-player.component.scss'],
})
export class DialogAddPlayerComponent {
  /* Bidirektionales Binding mittles [(ngModel)] mit einem matInput Feld, 
  siehe in 'dialog-add-player.component.html', <input matInput [(ngModel)]="name" />,  
  d.h. wenn sich etwas in Variable ändert, ändert sich auch das InputFeld, und genauso andersrum. */
  name: string = '';

  /* ' public dialogRef: MatDialogRef<DialogAddPlayerComponent> ' erforderlich laut Angular Dialog Doku für 'onNoClick()' Methode. */
  constructor(public dialogRef: MatDialogRef<DialogAddPlayerComponent>) {}

  /* Schliessen des Dialogsfensters */
  onNoClick(): void {
    this.dialogRef.close();
  }
}
