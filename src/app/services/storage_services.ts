import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Meta, Transaccion } from '../models/meta_model';

const KEY_METAS = 'ahorrospe_metas';
const KEY_TX = 'ahorrospe_tx';

@Injectable({ providedIn: 'root' })
export class StorageService {

    private _metas$ = new BehaviorSubject<Meta[]>(this._loadMetas());
    private _tx$ = new BehaviorSubject<Transaccion[]>(this._loadTx());

    // ── OBSERVABLES ──────────────────────────────────────────────────────────

    metas$(): Observable<Meta[]> { return this._metas$.asObservable(); }
    transacciones$(): Observable<Transaccion[]> { return this._tx$.asObservable(); }

    // ── SNAPSHOTS ────────────────────────────────────────────────────────────

    getMetas(): Meta[] { return this._metas$.value; }
    getTx(): Transaccion[] { return this._tx$.value; }
    getMeta(id: string): Meta | undefined {
        return this._metas$.value.find(m => m.id === id);
    }

    // ── METAS CRUD ───────────────────────────────────────────────────────────

    saveMeta(meta: Meta): void {
        const list = [...this._metas$.value];
        const idx = list.findIndex(m => m.id === meta.id);
        idx >= 0 ? list.splice(idx, 1, meta) : list.unshift(meta);
        this._pushMetas(list);
    }

    deleteMeta(id: string): void {
        this._pushMetas(this._metas$.value.filter(m => m.id !== id));
        this._pushTx(this._tx$.value.filter(t => t.metaId !== id));
    }

    // ── TRANSACCIONES CRUD ───────────────────────────────────────────────────

    addTransaccion(tx: Transaccion): void {
        // update meta amount
        const metas = [...this._metas$.value];
        const meta = metas.find(m => m.id === tx.metaId);
        if (meta) {
            meta.montoActual = tx.tipo === 'ingreso'
                ? meta.montoActual + tx.monto
                : Math.max(0, meta.montoActual - tx.monto);
            meta.completada = meta.montoActual >= meta.montoObjetivo;
            this._pushMetas(metas);
        }
        this._pushTx([tx, ...this._tx$.value]);
    }

    deleteTransaccion(id: string): void {
        const tx = this._tx$.value.find(t => t.id === id);
        if (!tx) return;
        // revert meta amount
        const metas = [...this._metas$.value];
        const meta = metas.find(m => m.id === tx.metaId);
        if (meta) {
            meta.montoActual = tx.tipo === 'ingreso'
                ? Math.max(0, meta.montoActual - tx.monto)
                : meta.montoActual + tx.monto;
            meta.completada = meta.montoActual >= meta.montoObjetivo;
            this._pushMetas(metas);
        }
        this._pushTx(this._tx$.value.filter(t => t.id !== id));
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────

    getTxByMeta(metaId: string): Transaccion[] {
        return this._tx$.value.filter(t => t.metaId === metaId)
            .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
    }

    getGastoHoy(metaId: string): number {
        const hoy = new Date().toISOString().slice(0, 10);
        return this._tx$.value
            .filter(t => t.metaId === metaId && t.tipo === 'gasto' && t.fecha === hoy)
            .reduce((s, t) => s + t.monto, 0);
    }

    getGastoSemana(metaId: string): { dia: string; gastos: number; ingresos: number }[] {
        const days: { dia: string; gastos: number; ingresos: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const iso = d.toISOString().slice(0, 10);
            const txDay = this._tx$.value.filter(t => t.metaId === metaId && t.fecha === iso);
            days.push({
                dia: iso,
                gastos: txDay.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0),
                ingresos: txDay.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0),
            });
        }
        return days;
    }

    getAhorroMensual(metaId: string): { mes: string; total: number }[] {
        const map = new Map<string, number>();
        this._tx$.value
            .filter(t => t.metaId === metaId && t.tipo === 'ingreso')
            .forEach(t => {
                const mes = t.fecha.slice(0, 7);
                map.set(mes, (map.get(mes) ?? 0) + t.monto);
            });
        return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
            .map(([mes, total]) => ({ mes, total }));
    }

    uid(): string {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    // ── PRIVATE ──────────────────────────────────────────────────────────────

    private _loadMetas(): Meta[] {
        try { return JSON.parse(localStorage.getItem(KEY_METAS) ?? '[]'); } catch { return []; }
    }
    private _loadTx(): Transaccion[] {
        try { return JSON.parse(localStorage.getItem(KEY_TX) ?? '[]'); } catch { return []; }
    }
    private _pushMetas(list: Meta[]): void {
        localStorage.setItem(KEY_METAS, JSON.stringify(list));
        this._metas$.next(list);
    }
    private _pushTx(list: Transaccion[]): void {
        localStorage.setItem(KEY_TX, JSON.stringify(list));
        this._tx$.next(list);
    }
}
