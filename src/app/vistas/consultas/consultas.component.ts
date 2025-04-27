import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consultas',
  imports: [CommonModule],
  templateUrl: './consultas.component.html',
  styleUrl: './consultas.component.css'
})
export class ConsultasComponent {
// Índice del panel abierto (-1 significa ninguno abierto)
openIndex: number = -1;


items = [
  {
    title: 'Renovación Licencias B, C, D y E',
    content: 'Información sobre la renovación de licencias B, C, D y E...'
  },
  {
    title: 'Primeras licencias clase B, C, D y E',
    content: 'Información sobre las primeras licencias clase B, C, D y E...'
  },
  
];

toggle(index: number) {
  
  this.openIndex = this.openIndex === index ? -1 : index;
}
}
