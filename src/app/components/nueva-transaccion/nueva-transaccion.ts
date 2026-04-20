import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage_services';
import { Meta, Transaccion, TipoTransaccion } from '../../models/meta_model';

@Component({
  selector: 'app-nueva-transaccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal modal-open" (click)="$event.target === $event.currentTarget && cerrar.emit()">
      <div class="modal-box bg-base-200 border border-base-300 rounded-2xl max-w-md w-full anim-in">

        <h3 class="font-display font-bold text-xl mb-6">Registrar movimiento</h3>

        <form (ngSubmit)="guardar()" #f="ngForm" class="space-y-4">

          <!-- Tipo -->
          <div>
            <label class="label-field">Tipo</label>
            <div class="grid grid-cols-2 gap-2">
              <button type="button"
                class="flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all"
                [ngClass]="tipo === 'ingreso' ? 'border-success bg-success/10 text-success' : 'border-base-300 text-base-content/50'"
                (click)="tipo = 'ingreso'">
                <span class="text-lg">↑</span> Ahorro / Ingreso
              </button>
              <button type="button"
                class="flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all"
                [ngClass]="tipo === 'gasto' ? 'border-error bg-error/10 text-error' : 'border-base-300 text-base-content/50'"
                (click)="tipo = 'gasto'">
                <span class="text-lg">↓</span> Gasto
              </button>
            </div>
          </div>

          <!-- Meta -->
          <div *ngIf="!metaIdFijo">
            <label class="label-field">Meta</label>
            <select class="select-styled" [(ngModel)]="metaSeleccionada" name="meta" required>
              <option value="">— Selecciona una meta —</option>
              <option *ngFor="let m of metas" [value]="m.id">
                {{ m.icono }} {{ m.nombre }}
              </option>
            </select>
          </div>

          <!-- Meta fija display -->
          <div *ngIf="metaIdFijo && metaActual" class="flex items-center gap-3 bg-base-300 rounded-xl px-4 py-3">
            <span class="text-2xl">{{ metaActual.icono }}</span>
            <div>
              <p class="font-medium text-sm">{{ metaActual.nombre }}</p>
              <p class="num text-xs text-base-content/40">
                S/ {{ metaActual.montoActual | number:'1.0-0' }} /
                S/ {{ metaActual.montoObjetivo | number:'1.0-0' }}
              </p>
            </div>
          </div>

          <!-- Monto -->
          <div>
            <label class="label-field">Monto (S/)</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50 num font-medium">S/</span>
              <input class="input-styled num pl-10" type="number" placeholder="0.00"
                     min="0.01" step="0.01"
                     [(ngModel)]="monto" name="monto" required>
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label class="label-field">Descripción</label>
            <input class="input-styled" type="text" placeholder="Ej: Sueldo de mayo, Almuerzo..."
                   [(ngModel)]="descripcion" name="descripcion" required maxlength="80">
          </div>

          <!-- Fecha -->
          <div>
            <label class="label-field">Fecha</label>
            <input class="input-styled" type="date" [(ngModel)]="fecha" name="fecha" required>
          </div>

          <!-- Alerta gasto diario -->
          <div *ngIf="tipo === 'gasto' && mostrarAlertaLimite"
               class="flex items-center gap-2 bg-warning/10 border border-warning/25 rounded-xl px-4 py-3 text-warning text-sm">
            <span>⚠️</span>
            <span>
              Al registrar esto superarás tu límite de
              <strong class="num">S/ {{ limiteGastoDiario | number:'1.2-2' }}</strong> hoy.
            </span>
          </div>

          <!-- Acciones -->
          <div class="flex gap-3 pt-2">
            <button type="button" class="btn btn-ghost rounded-xl flex-1"
                    (click)="cerrar.emit()">Cancelar</button>
            
            <button type="submit" 
                    class="flex-1 btn rounded-xl font-semibold transition-all"
                    (click)="guardar()"
                    [class.btn-success]="tipo === 'ingreso' && !f.invalid && monto && (metaSeleccionada || metaIdFijo)"
                    [class.btn-error]="tipo === 'gasto' && !f.invalid && monto && (metaSeleccionada || metaIdFijo)"
                    [class.btn-disabled]="f.invalid || !monto || (!metaSeleccionada && !metaIdFijo)"
                    [disabled]="f.invalid || !monto || (!metaSeleccionada && !metaIdFijo)">
              Registrar {{ tipo === 'ingreso' ? 'ahorro' : 'gasto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class NuevaTransaccionComponent implements OnInit {
  @Input() metaIdFijo?: string;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardada = new EventEmitter<Transaccion>();

  tipo: TipoTransaccion = 'ingreso';
  metaSeleccionada = '';
  monto: number | null = null;
  descripcion = '';
  fecha = new Date().toISOString().slice(0, 10);

  metas: Meta[] = [];
  metaActual?: Meta;

  constructor(private storage: StorageService) { }

  ngOnInit() {
    this.metas = this.storage.getMetas().filter(m => !m.completada);
    if (this.metaIdFijo) {
      this.metaActual = this.storage.getMeta(this.metaIdFijo);
      this.metaSeleccionada = this.metaIdFijo;
    }
  }

  get limiteGastoDiario(): number {
    const id = this.metaIdFijo ?? this.metaSeleccionada;
    const meta = this.storage.getMeta(id);
    return meta?.limiteGastoDiario ?? 0;
  }

  get mostrarAlertaLimite(): boolean {
    if (this.tipo !== 'gasto') return false;
    const id = this.metaIdFijo ?? this.metaSeleccionada;
    if (!id) return false;
    const lim = this.limiteGastoDiario;
    if (!lim) return false;
    const gastoHoy = this.storage.getGastoHoy(id);
    return gastoHoy + (this.monto ?? 0) > lim;
  }

  guardar() {
    const metaId = this.metaIdFijo ?? this.metaSeleccionada;
    if (!metaId || !this.monto || !this.descripcion) return;

    const tx: Transaccion = {
      id: this.storage.uid(),
      metaId,
      tipo: this.tipo,
      monto: +this.monto,
      descripcion: this.descripcion.trim(),
      fecha: this.fecha,
      creadoEn: new Date().toISOString(),
    };

    this.storage.addTransaccion(tx);
    this.guardada.emit(tx);
    this.cerrar.emit();
  }
}