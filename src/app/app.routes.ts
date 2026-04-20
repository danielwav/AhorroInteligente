import { Routes } from '@angular/router';

// Importamos los componentes que creamos
import { DashboardComponent } from './components/dashoboard/dashoboard';
import { MetasComponent } from './components/metas/metas';
import { DetalleMetaComponent } from './components/detalle-meta/detalle-meta';

export const routes: Routes = [
    // Si el usuario entra a la raíz (localhost:4200), lo mandamos al dashboard
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

    // Rutas principales
    { path: 'dashboard', component: DashboardComponent },
    { path: 'metas', component: MetasComponent },
    { path: 'metas/:id', component: DetalleMetaComponent }, // El ":id" es para el detalle de cada meta

    // Si alguien escribe una URL que no existe (ej: localhost:4200/otracosa), lo mandamos al dashboard
    { path: '**', redirectTo: 'dashboard' }
];