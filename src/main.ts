import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common'; // 👈 1. Importar esto
import localeEsPe from '@angular/common/locales/es-PE'; // 👈 2. Importar el idioma
import { App } from './app/app';
import { appConfig } from './app/app.config';

// 👈 3. Registrar el idioma ANTES de arrancar la app
registerLocaleData(localeEsPe);

bootstrapApplication(App, appConfig)
  .catch(err => console.error(err));