import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage_services';
import { Meta, ICONOS, COLORES } from '../../models/meta_model';

@Component({
  selector: 'app-nueva-meta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal modal-open" (click)="$event.target === $event.currentTarget && cerrar.emit()">
      <div class="modal-box bg-base-200 border border-base-300 rounded-2xl max-w-lg w-full anim-in">

        <h3 class="font-display font-bold text-xl mb-6">
          {{ editando ? 'Editar meta' : 'Nueva meta de ahorro' }}
        </h3>

        <form (ngSubmit)="guardar()" #f="ngForm" class="space-y-4">

          <!-- Nombre -->
          <div>
            <label class="label-field">Nombre de la meta</label>
            <input class="input-styled" type="text" placeholder="Ej: Viaje a Europa"
                  [(ngModel)]="form.nombre" name="nombre" required maxlength="50">
          </div>

          <!-- Descripción -->
          <div>
            <label class="label-field">Descripción (opcional)</label>
            <input class="input-styled" type="text" placeholder="Breve descripción..."
                  [(ngModel)]="form.descripcion" name="descripcion" maxlength="100">
          </div>

          <!-- Montos -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label-field">Meta (S/)</label>
              <input class="input-styled num" type="number" placeholder="0.00" min="1"
                    [(ngModel)]="form.montoObjetivo" name="montoObjetivo" required>
            </div>
            <div>
              <label class="label-field">Límite gasto/día (S/)</label>
              <input class="input-styled num" type="number" placeholder="0.00" min="0"
                    [(ngModel)]="form.limiteGastoDiario" name="limiteGastoDiario">
            </div>
          </div>

          <!-- Fechas -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label-field">Fecha inicio</label>
              <input class="input-styled" type="date"
                    [(ngModel)]="form.fechaInicio" name="fechaInicio" required>
            </div>
            <div>
              <label class="label-field">Fecha límite</label>
              <input class="input-styled" type="date"
                    [(ngModel)]="form.fechaLimite" name="fechaLimite" required>
            </div>
          </div>

          <!-- Ícono -->
          <div>
            <label class="label-field">Ícono</label>
            <div class="flex flex-wrap gap-2 mt-1">
              <button *ngFor="let i of ICONOS" type="button"
                      class="w-9 h-9 rounded-xl flex items-center justify-center text-lg
                            border-2 transition-all hover:scale-110"
                      [ngClass]="form.icono === i ? 'border-primary bg-primary/15' : 'border-transparent bg-base-300'"
                      (click)="form.icono = i">
                {{ i }}
              </button>
            </div>
          </div>

          <!-- Color -->
          <div>
            <label class="label-field">Color</label>
            <div class="flex flex-wrap gap-2 mt-1">
              <button *ngFor="let c of COLORES" type="button"
                      class="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                      [style.background-color]="c"
                      [class.border-white]="form.color === c"
                      [class.border-transparent]="form.color !== c"
                      [class.scale-110]="form.color === c"
                      (click)="form.color = c">
              </button>
            </div>
          </div>

          <!-- Ayudita visual para saber si falta algo -->
          <p class="text-[10px] text-center mb-0" 
            [class.text-error]="f.invalid || !form.montoObjetivo">
            {{ (f.invalid || !form.montoObjetivo) ? '⚠️ Faltan campos obligatorios o el monto es 0' : '✅ Formulario completo' }}
          </p>

          <!-- Acciones -->
          <div class="flex gap-3 pt-2">
            <button type="button" class="btn btn-ghost rounded-xl flex-1"
                    (click)="cerrar.emit()">Cancelar</button>
            <button type="submit" 
                    class="btn flex-1 font-semibold transition-all"
                    (click)="guardar()" 
                    [class.btn-primary]="!f.invalid && form.montoObjetivo"
                    [class.btn-disabled]="f.invalid || !form.montoObjetivo"
                    [disabled]="f.invalid || !form.montoObjetivo">
              {{ editando ? 'Guardar cambios' : 'Crear meta' }}
            </button>
          </div>
  `,
})
export class NuevaMetaComponent implements OnInit {
  @Input() metaEditar?: Meta;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardada = new EventEmitter<Meta>();

  ICONOS = ICONOS;
  COLORES = COLORES;
  editando = false;

  form = {
    nombre: '',
    descripcion: '',
    montoObjetivo: null as number | null,
    limiteGastoDiario: null as number | null,
    fechaInicio: new Date().toISOString().slice(0, 10),
    // ✅ CAMBIO: Fecha límite por defecto (6 meses después) para que no esté vacía
    fechaLimite: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10),
    icono: ICONOS[0],
    color: COLORES[0],
  };

  constructor(private storage: StorageService) { }

  ngOnInit() {
    if (this.metaEditar) {
      this.editando = true;
      this.form = {
        nombre: this.metaEditar.nombre,
        descripcion: this.metaEditar.descripcion,
        montoObjetivo: this.metaEditar.montoObjetivo,
        limiteGastoDiario: this.metaEditar.limiteGastoDiario || null,
        fechaInicio: this.metaEditar.fechaInicio,
        fechaLimite: this.metaEditar.fechaLimite,
        icono: this.metaEditar.icono,
        color: this.metaEditar.color,
      };
    }
  }

  guardar() {
    if (!this.form.nombre || !this.form.montoObjetivo) {
      return;
    }

    const meta: Meta = {
      id: this.metaEditar?.id ?? this.storage.uid(),
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion.trim(),
      icono: this.form.icono,
      color: this.form.color,
      montoObjetivo: +this.form.montoObjetivo,
      montoActual: this.metaEditar?.montoActual ?? 0,
      limiteGastoDiario: +(this.form.limiteGastoDiario ?? 0),
      fechaInicio: this.form.fechaInicio,
      fechaLimite: this.form.fechaLimite,
      completada: this.metaEditar?.completada ?? false,
      creadoEn: this.metaEditar?.creadoEn ?? new Date().toISOString(),
    };

    this.storage.saveMeta(meta);
    this.guardada.emit(meta);
    this.cerrar.emit();
  }
}