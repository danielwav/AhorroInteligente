import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { StorageService } from '../../services/storage_services';
import { Meta, Transaccion } from '../../models/meta_model';
import { NuevaTransaccionComponent } from '../nueva-transaccion/nueva-transaccion';
import { NuevaMetaComponent } from '../nueva-meta/nueva-meta';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NuevaTransaccionComponent, NuevaMetaComponent],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-up">
        <div>
          <h2 class="font-display font-bold text-3xl text-gradient">Dashboard</h2>
          <p class="text-base-content/60 text-sm mt-1">
            {{ hoy | date:'EEEE, d MMMM yyyy':'':'es-PE' }}
          </p>
        </div>
        <div class="flex gap-2">
          <!-- ✅ Cambiado a btn-outline para que resalte en dark mode -->
          <button class="btn btn-outline btn-primary rounded-xl text-sm"
                  (click)="modalMeta = true">
            🎯 Nueva meta
          </button>
          <!-- ✅ Agregamos font-bold explícito -->
          <button class="btn-glow font-bold" (click)="modalTx = true">
            + Registrar movimiento
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <div class="card-glass p-5 anim-up-1">
          <p class="text-base-content/60 text-[11px] uppercase tracking-widest mb-2">Total ahorrado</p>
          <p class="num text-2xl font-bold text-accent">S/ {{ totalAhorrado | number:'1.0-0' }}</p>
          <p class="text-[11px] text-base-content/50 mt-1 num">
            de S/ {{ totalObjetivo | number:'1.0-0' }}
          </p>
        </div>

        <div class="card-glass p-5 anim-up-2">
          <p class="text-base-content/40 text-[11px] uppercase tracking-widest mb-2">Metas activas</p>
          <p class="num text-2xl font-bold text-primary">{{ metasActivas }}</p>
          <p class="text-[11px] text-base-content/30 mt-1">{{ metasCompletadas }} completadas</p>
        </div>

        <div class="card-glass p-5 anim-up-3">
          <p class="text-base-content/40 text-[11px] uppercase tracking-widest mb-2">Gastos hoy</p>
          <!-- ✅ CORREGIDO: Usando ngClass con ternario -->
          <p class="num text-2xl font-bold" 
             [ngClass]="gastoHoyTotal > 0 ? 'text-error' : 'text-base-content/30'">
            S/ {{ gastoHoyTotal | number:'1.0-0' }}
          </p>
          <p class="text-[11px] text-base-content/30 mt-1">en todas las metas</p>
        </div>

        <div class="card-glass p-5 anim-up-4">
          <p class="text-base-content/40 text-[11px] uppercase tracking-widest mb-2">Progreso global</p>
          <p class="num text-2xl font-bold text-secondary">{{ progresoGlobal | number:'1.0-0' }}%</p>
          <div class="mt-2 h-1.5 bg-base-300 rounded-full overflow-hidden">
            <div class="h-full bg-secondary rounded-full transition-all duration-700"
                [style.width]="progresoGlobal + '%'"></div>
          </div>
        </div>
      </div>

      <!-- Alertas -->
      <div *ngIf="alertas.length" class="space-y-2 anim-up">
        <p class="text-sm font-display font-semibold flex items-center gap-2">
          <span>⚠️</span> Alertas de gasto diario
        </p>
        <div *ngFor="let a of alertas" class="alert-danger flex items-start gap-3">
          <span class="text-xl flex-shrink-0">🚨</span>
          <div class="text-sm">
            <strong>{{ a.meta.nombre }}</strong> —
            gastaste <span class="num font-bold">S/ {{ a.gastoHoy | number:'1.2-2' }}</span>
            hoy, superando el límite de
            <span class="num font-bold">S/ {{ a.meta.limiteGastoDiario | number:'1.2-2' }}</span>.
          </div>
        </div>
      </div>

      <!-- Metas resumen -->
      <div class="anim-up">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-display font-semibold text-lg">Metas de ahorro</h3>
          <a routerLink="/metas" class="text-primary text-sm hover:underline">Ver todas →</a>
        </div>

        <!-- Empty state -->
        <div *ngIf="!metas.length" class="card-glass p-14 text-center">
          <p class="text-5xl mb-4">🎯</p>
          <p class="font-display font-semibold text-xl mb-2">Sin metas aún</p>
          <p class="text-base-content/40 text-sm mb-6">Crea tu primera meta para empezar a ahorrar</p>
          <button class="btn-glow" (click)="modalMeta = true">Crear primera meta</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a *ngFor="let m of metas; let i = index"
            [routerLink]="['/metas', m.id]"
            class="card-glass p-5 hover:border-primary/30 transition-all block group"
             [style.animation-delay]="(i * 0.06) + 's'">

            <!-- Completada overlay -->
            <div *ngIf="m.completada"
                class="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-primary/5 pointer-events-none"></div>

            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    [style.background-color]="m.color + '20'">
                  {{ m.icono }}
                </div>
                <div class="min-w-0">
                  <p class="font-display font-semibold group-hover:text-primary transition-colors truncate">
                    {{ m.nombre }}
                  </p>
                  <p class="text-xs text-base-content/35">
                    {{ diasRestantes(m) > 0 ? diasRestantes(m) + ' días restantes' : 'Vencida' }}
                  </p>
                </div>
              </div>
              <span *ngIf="m.completada" class="badge badge-success text-[10px] flex-shrink-0">🎉 Lista</span>
            </div>

            <!-- Amounts -->
            <div class="flex justify-between items-end mb-2">
              <span class="num text-xl font-bold text-accent">
                S/ {{ m.montoActual | number:'1.0-0' }}
              </span>
              <span class="num text-xs text-base-content/40">
                meta S/ {{ m.montoObjetivo | number:'1.0-0' }}
              </span>
            </div>

            <!-- Progress bar -->
            <div class="h-2.5 bg-base-300 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                  [style.width]="clamp(pct(m), 100) + '%'"
                  [style.background-color]="m.completada ? '#3EDDB7' : m.color">
              </div>
            </div>
            <div class="flex justify-between mt-1.5 text-[11px] text-base-content/35">
              <span class="num">{{ pct(m) | number:'1.0-0' }}%</span>
              <span class="num">Faltan S/ {{ maxZero(m.montoObjetivo - m.montoActual) | number:'1.0-0' }}</span>
            </div>

            <!-- Límite diario superado -->
            <div *ngIf="gastoExcedido(m)"
                class="mt-3 text-xs text-error bg-error/10 rounded-lg px-3 py-2 flex items-center gap-2">
              ⚠️ Límite diario superado hoy
            </div>
          </a>
        </div>
      </div>

      <!-- Últimos movimientos -->
      <div class="anim-up">
        <h3 class="font-display font-semibold text-lg mb-4">Últimos movimientos</h3>

        <div *ngIf="!ultimosTx.length" class="card-glass p-8 text-center">
          <p class="text-base-content/35 text-sm">Sin movimientos aún</p>
        </div>

        <div *ngIf="ultimosTx.length" class="card-glass divide-y divide-base-300/60">
          <div *ngFor="let t of ultimosTx"
              class="flex items-center gap-4 px-5 py-3.5 hover:bg-base-300/20 transition-colors">

            <!-- ✅ CORREGIDO: Usando ngClass con ternario para evitar el error de '/' -->
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-bold"
                [ngClass]="t.tipo === 'ingreso' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'">
              {{ t.tipo === 'ingreso' ? '↑' : '↓' }}
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ t.descripcion }}</p>
              <p class="text-[11px] text-base-content/35">
                {{ metaNombre(t.metaId) }} · {{ t.fecha | date:'d MMM':'':'es-PE' }}
              </p>
            </div>

            <div class="text-right flex-shrink-0">
              <p class="num font-bold text-sm"
                [class.text-success]="t.tipo === 'ingreso'"
                [class.text-error]="t.tipo === 'gasto'">
                {{ t.tipo === 'ingreso' ? '+' : '-' }}S/ {{ t.monto | number:'1.2-2' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <app-nueva-meta *ngIf="modalMeta" (cerrar)="modalMeta = false"></app-nueva-meta>
    <app-nueva-transaccion *ngIf="modalTx" (cerrar)="modalTx = false"></app-nueva-transaccion>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  metas: Meta[] = [];
  ultimosTx: Transaccion[] = [];
  alertas: { meta: Meta; gastoHoy: number }[] = [];
  modalMeta = false;
  modalTx = false;
  hoy = new Date();

  private subs: Subscription[] = [];

  constructor(private storage: StorageService) { }

  ngOnInit() {
    this.subs.push(
      this.storage.metas$().subscribe(m => { this.metas = m; this.recalcAlertas(); }),
      this.storage.transacciones$().subscribe(ts => { this.ultimosTx = ts.slice(0, 8); }),
    );
  }
  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }

  get totalAhorrado() { return this.metas.reduce((s, m) => s + m.montoActual, 0); }
  get totalObjetivo() { return this.metas.reduce((s, m) => s + m.montoObjetivo, 0); }
  get metasActivas() { return this.metas.filter(m => !m.completada).length; }
  get metasCompletadas() { return this.metas.filter(m => m.completada).length; }
  get gastoHoyTotal() { return this.metas.reduce((s, m) => s + this.storage.getGastoHoy(m.id), 0); }
  get progresoGlobal() {
    if (!this.totalObjetivo) return 0;
    return Math.min((this.totalAhorrado / this.totalObjetivo) * 100, 100);
  }

  pct(m: Meta) { return m.montoObjetivo ? (m.montoActual / m.montoObjetivo) * 100 : 0; }
  clamp(v: number, max: number) { return Math.min(v, max); }
  diasRestantes(m: Meta) {
    return Math.max(0, Math.ceil((new Date(m.fechaLimite).getTime() - Date.now()) / 86400000));
  }
  gastoExcedido(m: Meta) {
    return m.limiteGastoDiario > 0 && this.storage.getGastoHoy(m.id) > m.limiteGastoDiario;
  }
  metaNombre(id: string) { return this.metas.find(m => m.id === id)?.nombre ?? '—'; }

  maxZero(v: number) { return Math.max(0, v); }

  recalcAlertas() {
    this.alertas = this.metas
      .filter(m => !m.completada && m.limiteGastoDiario > 0)
      .map(m => ({ meta: m, gastoHoy: this.storage.getGastoHoy(m.id) }))
      .filter(a => a.gastoHoy > a.meta.limiteGastoDiario);
  }
}