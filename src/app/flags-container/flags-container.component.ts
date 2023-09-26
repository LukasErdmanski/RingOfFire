// FlagsContainerComponent
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-flags-container',
  templateUrl: './flags-container.component.html',
  styleUrls: ['./flags-container.component.scss'],
})
export class FlagsContainerComponent {
  containerVisible: boolean = false;
  // currentLang: string = 'en'; // Default-Wert
  currentLang!: string; // Default-Wert

  constructor(public translate: TranslateService) {}

  ngOnInit() {
    this.getCurrentLang();
    this.translate.use(this.currentLang);
  }

  setCurrentLang(lang: string) {
    if (this.currentLang !== lang) {
      this.currentLang = lang;
      this.translate.use(this.currentLang);
      localStorage.setItem('currentLang', lang);
      console.log('Language changed to ' + this.currentLang);
    }
  }

  getCurrentLang(): void {
    this.currentLang = localStorage.getItem('currentLang') || 'en'; // Default value is 'en', if no entry was found in localStorage.
  }

  toggleContainerVisibility(): void {
    this.containerVisible = !this.containerVisible;
  }
}
