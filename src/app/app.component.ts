/**
 * Root application component.
 *
 * This component serves as the main entry point for the Angular application.
 * It's typically used to hold application-wide components such as navigation bars, footers, or side menus.
 * In this instance, it sets the title of the application.
 */
import { Component } from '@angular/core';

@Component({
    selector: 'app-root', // CSS selector that identifies this component in a template
    templateUrl: 'app.component.html', // Path to the component's template
    styleUrls: ['app.component.scss'], // Array of stylesheet URLs for this component
})
export class AppComponent {
    /** The title of the application. */
    title = 'LE - Ring of fire';
}