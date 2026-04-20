export type TipoTransaccion = 'ingreso' | 'gasto';

export interface Meta {
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    color: string;
    montoObjetivo: number;
    montoActual: number;
    limiteGastoDiario: number;
    fechaInicio: string;   // ISO date string
    fechaLimite: string;   // ISO date string
    completada: boolean;
    creadoEn: string;
}

export interface Transaccion {
    id: string;
    metaId: string;
    tipo: TipoTransaccion;
    monto: number;
    descripcion: string;
    fecha: string;   // ISO date string YYYY-MM-DD
    creadoEn: string;
}

export const ICONOS = [
    '🏠', '🚗', '✈️', '📱', '💻', '🎓', '💍', '🏖️',
    '🛍️', '🏋️', '🎮', '📷', '🎸', '🏡', '💰', '🎯',
    '🚀', '🌟', '💎', '🎁', '🐶', '🌿', '⚽', '🎨',
];

export const COLORES = [
    '#7C6EFF', '#FF6B8A', '#3EDDB7', '#F5C842',
    '#3ABFF8', '#F97316', '#A78BFA', '#FB7185',
    '#34D399', '#60A5FA', '#E879F9', '#FBBF24',
];
