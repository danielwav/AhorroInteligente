import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { StorageService } from '../../services/storage_services';
import { Meta } from '../../models/meta_model';
import { NuevaMetaComponent } from '../nueva-meta/nueva-meta';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [CommonModule, RouterLink, NuevaMetaComponent],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-up">
        <div>
          <h2 class="font-display font-bold text-3xl text-gradient">Mis Metas</h2>
          <p class="text-base-content/40 text-sm mt-1">
            {{ metas.length }} meta{{ metas.length !== 1 ? 's' : '' }} registrada{{ metas.length !== 1 ? 's' : '' }}
          </p>
        </div>
        <button class="btn-glow" (click)="modalMeta = true">🎯 Nueva meta</button>
      </div>

      <!-- Filtros -->
      <div class="flex gap-2 flex-wrap anim-up-1">
        <button *ngFor="let f of filtros"
                class="btn btn-sm rounded-xl border transition-all"
                [class.btn-primary]="filtroActivo === f.key"
                [class.border-primary]="filtroActivo === f.key"
                [class.btn-ghost]="filtroActivo !== f.key"
                [class.border-base-300]="filtroActivo !== f.key"
                (click)="filtroActivo = f.key">
          {{ f.label }}
          <span class="badge badge-sm ml-1"
                [class.badge-primary]="filtroActivo === f.key">{{ conteo(f.key) }}</span>
        </button>
      </div>

      <!-- Empty -->
      <div *ngIf="!metasFiltradas.length" class="card-glass p-16 text-center anim-up">
        <p class="text-5xl mb-4">🎯</p>
        <p class="font-display font-semibold text-xl mb-2">
          {{ metas.length ? 'Sin metas en este filtro' : 'Sin metas aún' }}
        </p>
        <p class="text-base-content/40 text-sm mb-6">
          {{ metas.length ? 'Prueba otro filtro' : 'Crea tu primera meta de ahorro para comenzar' }}
        </p>
        <button *ngIf="!metas.length" class="btn-glow" (click)="modalMeta = true">
          Crear primera meta
        </button>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let m of metasFiltradas; let i = index"
             class="card-glass p-5 group hover:border-primary/30 transition-all cursor-pointer"
             [style.animation-delay]="(i * 0.05) + 's'">

          <!-- Glow completada -->
          <div *ngIf="m.completada"
               class="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/6 to-transparent pointer-events-none"></div>

          <!-- Meta header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                   [style.background-color]="m.color + '20'">
                {{ m.icono }}
              </div>
              <div class="min-w-0">
                <p class="font-display font-bold truncate">{{ m.nombre }}</p>
                <p class="text-xs text-base-content/35 truncate">{{ m.descripcion || 'Sin descripción' }}</p>
              </div>
            </div>
            <!-- Actions menu -->
            <div class="dropdown dropdown-end flex-shrink-0">
              <button tabindex="0" class="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="4" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="10" cy="16" r="1.5"/>
                </svg>
              </button>
              <ul tabindex="0" class="dropdown-content menu bg-base-300 border border-base-200 rounded-xl shadow-xl p-1 w-36 z-10">
                <li><a [routerLink]="['/metas', m.id]" class="rounded-lg text-sm">📊 Ver detalle</a></li>
                <li><a (click)="editar(m)" class="rounded-lg text-sm">✏️ Editar</a></li>
                <li><a (click)="confirmarBorrar(m)" class="rounded-lg text-sm text-error">🗑 Eliminar</a></li>
              </ul>
            </div>
          </div>

          <!-- Progress -->
          <div class="mb-3">
            <div class="flex justify-between text-xs mb-1.5">
              <span class="num font-bold text-accent">S/ {{ m.montoActual | number:'1.0-0' }}</span>
              <span class="num text-base-content/40">S/ {{ m.montoObjetivo | number:'1.0-0' }}</span>
            </div>
            <div class="h-3 bg-base-300 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                   [style.width]="pct(m) + '%'"
                   [style.background-color]="m.completada ? '#3EDDB7' : m.color">
              </div>
            </div>
            <div class="flex justify-between mt-1 text-[11px] text-base-content/30">
              <span class="num">{{ pct(m) | number:'1.0-0' }}%</span>
              <!-- ✅ FIX: Usar maxZero para evitar "Faltan -S/ 200" -->
              <span *ngIf="!m.completada" class="num">
                Faltan S/ {{ maxZero(m.montoObjetivo - m.montoActual) | number:'1.0-0' }}
              </span>
              <span *ngIf="m.completada" class="text-accent font-semibold">✓ Completada</span>
            </div>
          </div>

          <!-- Info pills -->
          <div class="flex flex-wrap gap-1.5 mb-3">
            <span class="badge badge-ghost badge-sm num">
              📅 {{ diasRestantes(m) }}d restantes
            </span>
            <span *ngIf="m.limiteGastoDiario > 0" class="badge badge-ghost badge-sm num">
              💸 Límite S/ {{ m.limiteGastoDiario | number:'1.0-0' }}/día
            </span>
            <span *ngIf="m.completada" class="badge badge-success badge-sm">🎉 Meta alcanzada</span>
          </div>

          <!-- Alert -->
          <div *ngIf="gastoExcedido(m)"
               class="text-xs text-error bg-error/10 rounded-lg px-3 py-2 flex items-center gap-2 mb-3">
            ⚠️ Límite diario superado
          </div>

          <!-- CTA -->
          <a [routerLink]="['/metas', m.id]"
             class="btn btn-sm btn-ghost border border-base-300 hover:border-primary hover:text-primary rounded-xl w-full text-xs transition-all">
            Ver movimientos →
          </a>
        </div>
      </div>
    </div>

    <!-- Modal nueva/editar meta -->
    <app-nueva-meta *ngIf="modalMeta"
                    [metaEditar]="metaEditando ?? undefined"
                    (cerrar)="cerrarModal()">
    </app-nueva-meta>

    <!-- Confirm delete -->
    <div *ngIf="metaBorrar" class="modal modal-open">
      <div class="modal-box bg-base-200 border border-base-300 rounded-2xl max-w-sm anim-in">
        <h3 class="font-display font-bold text-xl mb-2">¿Eliminar meta?</h3>
        <p class="text-base-content/60 text-sm mb-2">
          Vas a eliminar <strong>"{{ metaBorrar.nombre }}"</strong> y todos sus movimientos.
        </p>
        <p class="text-error text-xs mb-6">Esta acción no se puede deshacer.</p>
        <div class="flex gap-3">
          <button class="btn btn-ghost rounded-xl flex-1" (click)="metaBorrar = null">Cancelar</button>
          <button class="btn btn-error rounded-xl flex-1" (click)="borrar()">Eliminar</button>
        </div>
      </div>
    </div>
  `,
})
export class MetasComponent implements OnInit, OnDestroy {
  metas: Meta[] = [];
  modalMeta = false;
  metaEditando: Meta | null = null;
  metaBorrar: Meta | null = null;
  filtroActivo: 'todas' | 'activas' | 'completadas' = 'todas';

  filtros = [
    { key: 'todas' as const, label: 'Todas' },
    { key: 'activas' as const, label: 'Activas' },
    { key: 'completadas' as const, label: 'Completadas' },
  ];

  private sub?: Subscription;
  constructor(private storage: StorageService) { }

  ngOnInit() {
    this.sub = this.storage.metas$().subscribe(m => this.metas = m);
  }
  ngOnDestroy() { this.sub?.unsubscribe(); }

  get metasFiltradas(): Meta[] {
    if (this.filtroActivo === 'activas') return this.metas.filter(m => !m.completada);
    if (this.filtroActivo === 'completadas') return this.metas.filter(m => m.completada);
    return this.metas;
  }

  conteo(k: string) {
    if (k === 'activas') return this.metas.filter(m => !m.completada).length;
    if (k === 'completadas') return this.metas.filter(m => m.completada).length;
    return this.metas.length;
  }

  pct(m: Meta) { return Math.min(m.montoObjetivo ? (m.montoActual / m.montoObjetivo) * 100 : 0, 100); }

  diasRestantes(m: Meta) {
    return Math.max(0, Math.ceil((new Date(m.fechaLimite).getTime() - Date.now()) / 86400000));
  }

  gastoExcedido(m: Meta) {
    return m.limiteGastoDiario > 0 && this.storage.getGastoHoy(m.id) > m.limiteGastoDiario;
  }

  // ✅ Helper añadido para evitar números negativos en el HTML
  maxZero(v: number) { return Math.max(0, v); }

  editar(m: Meta) { this.metaEditando = m; this.modalMeta = true; }
  confirmarBorrar(m: Meta) { this.metaBorrar = m; }
  borrar() { if (this.metaBorrar) { this.storage.deleteMeta(this.metaBorrar.id); this.metaBorrar = null; } }
  cerrarModal() { this.modalMeta = false; this.metaEditando = null; }
}