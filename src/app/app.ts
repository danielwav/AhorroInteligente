import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-mesh flex flex-col">

      <!-- ── Navbar ── -->
      <header class="sticky top-0 z-50 border-b border-base-300/60 bg-base-100/80 backdrop-blur-xl">
        <nav class="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">

          <!-- Logo -->
          <a routerLink="/dashboard" class="flex items-center gap-3 group">
            <div class="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center
                        ring-1 ring-primary/20 group-hover:ring-primary/50 transition-all">
              <span class="text-xl leading-none">💸</span>
            </div>
            <div class="leading-none">
              <p class="font-display font-bold text-base text-gradient">AhorrosInteligentes</p>
              <p class="text-[10px] text-base-content/35 tracking-widest uppercase">Gestión de ahorros</p>
            </div>
          </a>

          <!-- Nav links -->
          <div class="flex gap-1">
            <!-- ✅ CORREGIDO: routerLinkActive ahora usa array para clases con '/' y '!' -->
            <a routerLink="/dashboard" [routerLinkActive]="['bg-primary/10', '!text-primary']"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                      text-base-content/60 hover:text-primary hover:bg-primary/10 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <!-- ✅ CORREGIDO: Etiquetas SVG cerradas explícitamente para evitar errores del parser -->
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
              <span class="hidden sm:inline">Dashboard</span>
            </a>
            <a routerLink="/metas" [routerLinkActive]="['bg-primary/10', '!text-primary']"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                      text-base-content/60 hover:text-primary hover:bg-primary/10 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
              <span class="hidden sm:inline">Mis Metas</span>
            </a>
          </div>
        </nav>
      </header>

      <!-- ── Page content ── -->
      <main class="flex-1 container mx-auto max-w-6xl px-4 py-6">
        <router-outlet></router-outlet>
      </main>

      <!-- ── Footer ── -->
      <footer class="border-t border-base-300/40 py-3 text-center">
        <p class="num text-[11px] text-base-content/25">
          AhorrosPE · datos guardados localmente en tu navegador
        </p>
      </footer>
    </div>
  `,
})
export class App { }