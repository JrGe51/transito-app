import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RutService {
  constructor() { }

  // Función para validar el formato del RUT
  validarFormatoRut(rut: string): boolean {
    if (!/^[0-9]{7,8}-[0-9kK]{1}$/.test(rut)) {
      return false;
    }
    return true;
  }

  // Función para calcular el dígito verificador
  calcularDigitoVerificador(rut: string): string {
    // Eliminar el dígito verificador y el guión si existen
    const rutLimpio = rut.split('-')[0];
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    // Para cada dígito del RUT
    for (let i = rutLimpio.length - 1; i >= 0; i--) {
      suma += parseInt(rutLimpio[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    // Calcular dígito verificador
    const dv = 11 - (suma % 11);
    
    // Convertir a string según el resultado
    if (dv === 11) return '0';
    if (dv === 10) return 'K';
    return dv.toString();
  }

  // Función para validar el RUT completo
  validarRut(rut: string): boolean {
    if (!this.validarFormatoRut(rut)) {
      return false;
    }

    const rutLimpio = rut.split('-')[0];
    const dvIngresado = rut.split('-')[1].toUpperCase();
    const dvCalculado = this.calcularDigitoVerificador(rutLimpio);

    return dvIngresado === dvCalculado;
  }

  // Función para verificar si el RUT es válido
  esMayorDeEdad(rut: string): { esValido: boolean; mensaje: string } {
    if (!this.validarRut(rut)) {
      return { 
        esValido: false, 
        mensaje: 'RUT inválido. Por favor, verifica el número y el dígito verificador.' 
      };
    }

    return { 
      esValido: true, 
      mensaje: 'RUT válido.' 
    };
  }
} 