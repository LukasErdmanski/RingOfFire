import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Component for handling and displaying available languages using flags.
 */
@Component({
    selector: 'app-flags-container',
    templateUrl: './flags-container.component.html',
    styleUrls: ['./flags-container.component.scss'],
})
export class FlagsContainerComponent implements OnInit {
    /** Indicates if the language selection container is visible or not. */
    public containerVisible: boolean = false;

    /** Stores the current language. 'en' is the default language. */
    public currentLang!: string;

    /**
     * Initializes a new instance of the `FlagsContainerComponent`.
     * @param translate - Service for translating content based on the selected language.
     */
    constructor(public translate: TranslateService) {}

    /**
     * Lifecycle method called after the component's view (and child views) are initialized.
     * Retrieves the current language from local storage and sets it for the translation service.
     */
    public ngOnInit(): void {
        this.getCurrentLang();
        this.translate.use(this.currentLang);
    }

    /**
     * Sets and uses the given language as the current language.
     * @param lang - The language code to set.
     */
    public setCurrentLang(lang: string): void {
        if (this.currentLang !== lang) {
            this.currentLang = lang;
            this.translate.use(this.currentLang);
            localStorage.setItem('currentLang', lang);
        }
    }

    /**
     * Initializes the current language from local storage or defaults to 'en'.
     */
    public getCurrentLang(): void {
        this.currentLang = localStorage.getItem('currentLang') || 'en'; // Default value is 'en'.
    }

    /**
     * Toggles the visibility of the language selection container.
     */
    public toggleContainerVisibility(): void {
        this.containerVisible = !this.containerVisible;
    }
}