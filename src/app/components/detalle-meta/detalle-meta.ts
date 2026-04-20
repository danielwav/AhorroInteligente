import confetti from 'canvas-confetti';
import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivatedRoute, RouterLink } from '@angular/router'; 
import { Subscription } from 'rxjs';
import { StorageService } from '../../services/storage_services';
import { Meta, Transaccion } from '../../models/meta_model';
import { NuevaTransaccionComponent } from '../nueva-transaccion/nueva-transaccion';
import { NuevaMetaComponent } from '../nueva-meta/nueva-meta';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-detalle-meta',
  standalone: true,
  imports: [CommonModule, RouterLink, NuevaTransaccionComponent, NuevaMetaComponent],
  template: `
    <div *ngIf="meta" class="space-y-6">

      <!-- Back + Header -->
      <div class="anim-up">
        <a routerLink="/metas" class="inline-flex items-center gap-2 text-sm text-base-content/40
                                      hover:text-primary transition-colors mb-4">
          ← Volver a metas
        </a>

        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                [style.background-color]="meta.color + '20'">
              {{ meta.icono }}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="font-display font-bold text-3xl">{{ meta.nombre }}</h2>
                <span *ngIf="meta.completada" class="badge badge-success">🎉 Completada</span>
              </div>
              <p class="text-base-content/40 text-sm mt-0.5">{{ meta.descripcion || 'Sin descripción' }}</p>
            </div>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button class="btn btn-ghost btn-sm rounded-xl border border-base-300" (click)="modalEditar = true">
              ✏️ Editar
            </button>
            <button class="btn-glow btn-sm" (click)="modalTx = true">+ Movimiento</button>
          </div>
        </div>
      </div>

      <!-- 🎉 Celebración -->
      <div *ngIf="meta.completada"
          class="card-glass border-accent/30 p-6 text-center anim-up bg-gradient-to-br from-accent/5 to-primary/5">
        <p class="text-4xl mb-2">🎉</p>
        <p class="font-display font-bold text-xl text-accent">¡Meta alcanzada!</p>
        <p class="text-base-content/50 text-sm mt-1">
          Lograste ahorrar <span class="num font-bold text-accent">S/ {{ meta.montoActual | number:'1.2-2' }}</span>
        </p>
      </div>

      <!-- KPIs + Barra de progreso -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 anim-up-1">
        <div class="card-glass p-5">
          <p class="text-base-content/40 text-[11px] uppercase tracking-widest mb-2">Ahorrado</p>
          <p class="num text-2xl font-bold text-accent">S/ {{ meta.montoActual | number:'1.0-0' }}</p>
        </div>
        <div class="card-glass p-5">
          <p class="text-base-content/40 text-[11px] uppercase tracking-widest mb-2">Objetivo</p>
          <p class="num text-2xl font-bold text-primary">S/ {{ meta.montoObjetivo | number:'1.0-0' }}</p>
        </div>
        <div class="card-glass p-5">
          <p class="text-base-content/40 text-[11px] uppercase tracking-widest mb-2">Faltan</p>
          <p class="num text-2xl font-bold text-secondary">
            S/ {{ montoFaltante | number:'1.0-0' }}
          </p>
        </div>
        <div class="card-glass p-5">
          <p class="text-base-content/40 text-[11px] uppercase tracking-widest mb-2">Días restantes</p>
          <p class="num text-2xl font-bold"
             [class.text-error]="diasRestantes <= 7 && !meta.completada"
             [class.text-warning]="diasRestantes > 7 && diasRestantes <= 30 && !meta.completada"
             [class.text-base-content]="diasRestantes > 30 || meta.completada">
            {{ diasRestantes }}
          </p>
        </div>
      </div>

      <!-- Big Progress bar -->
      <div class="card-glass p-6 anim-up-2">
        <div class="flex justify-between items-center mb-3">
          <p class="font-display font-semibold">Progreso de ahorro</p>
          <p class="num font-bold text-lg" [style.color]="meta.color">{{ pct | number:'1.1-1' }}%</p>
        </div>
        <div class="h-5 bg-base-300 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-1000 relative"
               [style.width]="pct + '%'"
               [style.background-color]="meta.color">
            <div class="absolute inset-0 rounded-full shimmer opacity-40"></div>
          </div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-base-content/35 num">
          <span>S/ 0</span>
          <span *ngIf="diasRestantes > 0 && !meta.completada">
            Ritmo sugerido: S/ {{ ritmoSugerido | number:'1.0-0' }}/día
          </span>
          <span>S/ {{ meta.montoObjetivo | number:'1.0-0' }}</span>
        </div>
      </div>

      <!-- Alerta gasto diario -->
      <div *ngIf="alertaGasto" class="alert-danger flex items-start gap-3 anim-up">
        <span class="text-xl">🚨</span>
        <div class="text-sm">
          <strong>Límite diario superado</strong> — gastaste
          <span class="num font-bold">S/ {{ gastoHoy | number:'1.2-2' }}</span>
          de un límite de
          <span class="num font-bold">S/ {{ meta.limiteGastoDiario | number:'1.2-2' }}</span> hoy.
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 anim-up-3">

        <!-- Gráfica mensual -->
        <div class="card-glass p-5">
          <p class="font-display font-semibold mb-4">Ahorro mensual</p>
          <div class="relative h-52">
            <canvas #chartMensual></canvas>
            <div *ngIf="!ahorroMensual.length"
                 class="absolute inset-0 flex items-center justify-center text-base-content/30 text-sm">
              Sin datos mensuales aún
            </div>
          </div>
        </div>

        <!-- Resumen semanal -->
        <div class="card-glass p-5">
          <p class="font-display font-semibold mb-4">Resumen semanal</p>
          <div class="relative h-52">
            <canvas #chartSemana></canvas>
          </div>
          <!-- Totales semana -->
          <div class="flex gap-4 mt-3 pt-3 border-t border-base-300/50">
            <div class="flex-1 text-center">
              <p class="text-[11px] text-base-content/40 uppercase tracking-widest">Ahorros</p>
              <p class="num font-bold text-success text-sm">
                +S/ {{ totalIngSemana | number:'1.0-0' }}
              </p>
            </div>
            <div class="w-px bg-base-300"></div>
            <div class="flex-1 text-center">
              <p class="text-[11px] text-base-content/40 uppercase tracking-widest">Gastos</p>
              <p class="num font-bold text-error text-sm">
                -S/ {{ totalGastoSemana | number:'1.0-0' }}
              </p>
            </div>
            <div class="w-px bg-base-300"></div>
            <div class="flex-1 text-center">
              <p class="text-[11px] text-base-content/40 uppercase tracking-widest">Neto</p>
              <p class="num font-bold text-sm"
                 [class.text-accent]="(totalIngSemana - totalGastoSemana) >= 0"
                 [class.text-error]="(totalIngSemana - totalGastoSemana) < 0">
                S/ {{ (totalIngSemana - totalGastoSemana) | number:'1.0-0' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de movimientos -->
      <div class="anim-up-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-display font-semibold text-lg">Historial de movimientos</h3>
          <div class="flex gap-1">
            <button *ngFor="let f of filtrosTx"
                    class="btn btn-xs rounded-lg border transition-all"
                    [class.btn-primary]="filtroTx === f.key"
                    [class.border-primary]="filtroTx === f.key"
                    [class.btn-ghost]="filtroTx !== f.key"
                    [class.border-base-300]="filtroTx !== f.key"
                    (click)="filtroTx = f.key">
              {{ f.label }}
            </button>
          </div>
        </div>

        <div *ngIf="!txFiltradas.length" class="card-glass p-10 text-center">
          <p class="text-base-content/30 text-sm">Sin movimientos{{ filtroTx !== 'todos' ? ' en este filtro' : ' aún' }}</p>
        </div>

        <div *ngIf="txFiltradas.length" class="card-glass divide-y divide-base-300/50">
          <div *ngFor="let t of txFiltradas"
               class="flex items-center gap-4 px-5 py-3.5 hover:bg-base-300/20 transition-colors group">

            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-base"
                 [ngClass]="t.tipo === 'ingreso' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'">
              {{ t.tipo === 'ingreso' ? '↑' : '↓' }}
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ t.descripcion }}</p>
              <p class="text-[11px] text-base-content/35 num">
                {{ t.fecha | date:'EEEE, d MMMM yyyy':'':'es-PE' }}
              </p>
            </div>

            <div class="text-right flex-shrink-0 flex items-center gap-3">
              <div>
                <p class="num font-bold text-sm"
                  [class.text-success]="t.tipo === 'ingreso'"
                  [class.text-error]="t.tipo === 'gasto'">
                  {{ t.tipo === 'ingreso' ? '+' : '-' }}S/ {{ t.monto | number:'1.2-2' }}
                </p>
                <p class="text-[10px] text-base-content/30 num">
                  {{ t.fecha | date:'HH:mm':'':'es-PE' }}
                </p>
              </div>
              <button class="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity text-error"
                      (click)="confirmarEliminarTx(t)">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- ✅ MODALES DESCOMENTADOS Y CONFIGURADOS -->
      <app-nueva-transaccion 
        *ngIf="modalTx" 
        [metaIdFijo]="meta!.id" 
        (cerrar)="modalTx = false"
        (guardada)="modalTx = false">
      </app-nueva-transaccion>

      <app-nueva-meta 
        *ngIf="modalEditar" 
        [metaEditar]="meta!" 
        (cerrar)="modalEditar = false">
      </app-nueva-meta>

    </div>
  `,
})
export class DetalleMetaComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartMensual') chartMensualRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartSemana') chartSemanaRef!: ElementRef<HTMLCanvasElement>;

  meta?: Meta;
  txMeta: Transaccion[] = [];
  loading = true;

  modalTx = false;
  modalEditar = false;
  txBorrar: Transaccion | null = null;
  filtroTx: 'todos' | 'ingreso' | 'gasto' = 'todos';

  filtrosTx = [
    { key: 'todos' as const, label: 'Todos' },
    { key: 'ingreso' as const, label: 'Ahorros' },
    { key: 'gasto' as const, label: 'Gastos' },
  ];

  ahorroMensual: { mes: string; total: number }[] = [];
  semanaDatos: { dia: string; gastos: number; ingresos: number }[] = [];

  private chartM?: Chart;
  private chartS?: Chart;
  private subs: Subscription[] = [];
  private chartsReady = false;

  constructor(
    private route: ActivatedRoute,
    private storage: StorageService,
    private cdr: ChangeDetectorRef,
  ) { } //  Eliminado "private router: Router" del constructor ya que no se usa

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.subs.push(
      this.storage.metas$().subscribe(metas => {
        const metaAnterior = this.meta;
        this.meta = metas.find(m => m.id === id);
        this.loading = false;
        if (this.meta) {
          this.ahorroMensual = this.storage.getAhorroMensual(id);
          this.semanaDatos = this.storage.getGastoSemana(id);
          if (this.chartsReady) this.renderCharts();
          
          // ✅ NUEVA LÓGICA: Comparamos los montos directamente
          const estabaCompletada = metaAnterior ? (metaAnterior.montoActual >= metaAnterior.montoObjetivo) : false;
          const estaCompletada = this.meta.montoActual >= this.meta.montoObjetivo;

          // Si ahora está completada pero ANTES no lo estaba, ¡lanzamos confeti!
          if (estaCompletada && !estabaCompletada) {
            this.lanzarConfeti();
          }
        }
        this.cdr.detectChanges();
      }),
      // 
      this.storage.transacciones$().subscribe(() => {
        this.txMeta = this.storage.getTxByMeta(id);
        if (this.meta) {
          this.ahorroMensual = this.storage.getAhorroMensual(id);
          this.semanaDatos = this.storage.getGastoSemana(id);
          if (this.chartsReady) this.renderCharts();
        }
        this.cdr.detectChanges();
      }),
    );
  }

  ngAfterViewInit() {
    this.chartsReady = true;
    if (this.meta) this.renderCharts();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.chartM?.destroy();
    this.chartS?.destroy();
  }

  get montoFaltante(): number {
    if (!this.meta) return 0;
    return Math.max(0, this.meta.montoObjetivo - this.meta.montoActual);
  }

  get pct() { return this.meta ? Math.min((this.meta.montoActual / this.meta.montoObjetivo) * 100, 100) : 0; }
  get gastoHoy() { return this.meta ? this.storage.getGastoHoy(this.meta.id) : 0; }
  get alertaGasto() { return this.meta! && this.meta!.limiteGastoDiario > 0 && this.gastoHoy > this.meta!.limiteGastoDiario; }

  get diasRestantes() {
    if (!this.meta) return 0;
    return Math.max(0, Math.ceil((new Date(this.meta.fechaLimite).getTime() - Date.now()) / 86400000));
  }
  get ritmoSugerido() {
    if (!this.meta) return 0;
    const falta = Math.max(0, this.meta.montoObjetivo - this.meta.montoActual);
    return this.diasRestantes > 0 ? falta / this.diasRestantes : 0;
  }

  get txFiltradas(): Transaccion[] {
    if (this.filtroTx === 'todos') return this.txMeta;
    return this.txMeta.filter(t => t.tipo === this.filtroTx);
  }
  get totalIngSemana() { return this.semanaDatos.reduce((s, d) => s + d.ingresos, 0); }
  get totalGastoSemana() { return this.semanaDatos.reduce((s, d) => s + d.gastos, 0); }

  confirmarEliminarTx(t: Transaccion) { this.txBorrar = t; }
  eliminarTx() {
    if (this.txBorrar) { this.storage.deleteTransaccion(this.txBorrar.id); this.txBorrar = null; }
  }

    lanzarConfeti() {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#7C6EFF', '#3EDDB7', '#FFD700', '#FF5B7A'] // Púrpura, verde, dorado, rosa
    });
  }
  

  private renderCharts() {
    this.renderMensual();
    this.renderSemana();
  }

  private renderMensual() {
    this.chartM?.destroy();
    if (!this.chartMensualRef?.nativeElement || !this.ahorroMensual.length) return;

    const labels = this.ahorroMensual.map(d => {
      const [y, m] = d.mes.split('-');
      return new Date(+y, +m - 1).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
    });

    const bgColor = (this.meta?.color ?? '#7C6EFF') + 'AA';
    const borderColor = this.meta?.color ?? '#7C6EFF';

    this.chartM = new Chart(this.chartMensualRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Ahorro (S/)',
          data: this.ahorroMensual.map(d => d.total),
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(226,226,238,0.5)', font: { family: 'JetBrains Mono', size: 11 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(226,226,238,0.5)', font: { family: 'JetBrains Mono', size: 11 }, callback: (v) => 'S/ ' + v } },
        },
      },
    });
  }

  private renderSemana() {
    this.chartS?.destroy();
    if (!this.chartSemanaRef?.nativeElement) return;

    const labels = this.semanaDatos.map(d =>
      new Date(d.dia + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' })
    );

    this.chartS = new Chart(this.chartSemanaRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Ahorros',
            data: this.semanaDatos.map(d => d.ingresos),
            backgroundColor: 'rgba(62,221,183,0.6)',
            borderColor: '#3EDDB7',
            borderWidth: 2, borderRadius: 6, borderSkipped: false,
          },
          {
            label: 'Gastos',
            data: this.semanaDatos.map(d => d.gastos),
            backgroundColor: 'rgba(255,91,122,0.5)',
            borderColor: '#FF5B7A',
            borderWidth: 2, borderRadius: 6, borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: 'rgba(226,226,238,0.6)', font: { family: 'DM Sans', size: 11 }, boxWidth: 12, borderRadius: 4 } },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(226,226,238,0.5)', font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(226,226,238,0.5)', font: { family: 'JetBrains Mono', size: 10 }, callback: (v) => 'S/' + v } },
        },
      },
    });
  }
}