import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-player',
  templateUrl: './edit-player.component.html',
  styleUrls: ['./edit-player.component.scss'],
})
export class EditPlayerComponent {
  allProfilesPictures: string[] = ['1.webp', '2.png', 'monkey.png', 'pinguin.svg', 'serious-woman.svg', 'winkboy.svg'];

  constructor(public dialogRef: MatDialogRef<EditPlayerComponent>) { }

    /* Schliessen des Dialogsfensters */
    onNoClick(): void {
      this.dialogRef.close();
    }
}
