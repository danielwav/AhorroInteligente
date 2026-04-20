import { Pipe, PipeTransform } from '@angular/core';

/** Usage: {{ [0, value] | maxVal }} — returns Math.max(...values) */
@Pipe({ name: 'maxVal', standalone: true })
export class MaxValPipe implements PipeTransform {
    transform(values: number[]): number {
        return Math.max(...values);
    }
}
