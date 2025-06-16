import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

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
    title: 'Renovación Licencias B, C, D y F',
    content: `<div>
                <b>¿CUÁL ES EL COSTO DEL TRAMITE?</b>
                <br>El valor de la renovación tiene un costo de 0,50 UTM.</br>
                <br></br>
                <b>¿QUÉ SE NECESITA PARA HACER ESTE TRAMITE?</b>
                <li>Cédula de identidad vigente y fotocopia simple por ambos lados.</li>
                <li>Licencia de conducir y fotocopia simple por ambos lados.</li>
                <li>En caso de cambio de domicilio, certificado de residencia que acredite domicilio en la comuna de Lo espejo, 
                    otorgado por la Junta de Vecinos o Unión Comunal de Juntas de vecinos.</li>
                <li>Descargar, imprimir y completar la declaración de salud y presentarla para agilizar la obtención de su licencia.</li>
              </div>`
  },
  {
    title: 'Requisitos Primeras licencias clase B y C',
    content: `<div>
                <b>Clase B:</b>
                <br>Para conducir vehículos motorizados de tres o cuatro ruedas, para el transporte particular de personas, con capacidad de hasta 9 asientos, 
                    o de carga cuyo peso bruto vehicular sea de hasta 3.500 Kgs., tales como automóviles, motocoupes, camionetas, furgones y furgonetas.</br>
                <br></br>
                <b><u>Requisitos:</u></b>
                <li>Poseer Cédula de Identidad.</li>
                <li>Ser mayor de 18 años.</li>
                <li>Acreditar Enseñanza Básica, Certificado de Estudios (mínimo 8º año básico aprobado) reconocido por el Ministerio de Educación.</li>
                <li>Acreditar domicilio en la comuna a través de certificado de hoja de vida del conductor o Registro Social de Hogares.</li>
                <br></br>
                <b>Clase C:</b>
                <br>Para conducir vehículos motorizados de tres o cuatro ruedas, con motor fijo o agregado, como motocicletas, motonetas, bicimotos y otros similares.</br>
                <br></br>
                <b><u>Requisitos:</u></b>
                <li>Poseer Cédula de Identidad.</li>
                <li>Ser mayor de 18 años.</li>
                <li>Acreditar Enseñanza Básica, Certificado de Estudios (mínimo 8º año básico aprobado) reconocido por el Ministerio de Educación.</li>
                <li>Acreditar domicilio en la comuna a través de certificado de hoja de vida del conductor o Registro Social de Hogares.</li>
                <br></br>
                <b>Exámenes a rendir: (Clases B y C)</b>
                <br></br>
                <li>1. Examen Teórico.</li>
                <li>2. Examen Psicométrico.</li>
                <li>3. Examen Sensométrico.</li>
                <li>4. Entrevista Médica.</li>
                <li>5. Examen Práctico (vehículo requerido para la clase).</li>
                <br></br>
                <b>CASOS ESPECIALES:</b>
                <b>Requisitos Postulantes de 17 años: (Sólo Clase B)</b>
                <li>Los mismos requisitos anteriores.</li>
                <li>Autorización notarial de los padres o representante legal, para ser presentado en la Escuela de Conductores.</li>
                <li>Certificado de Aprobación de Escuela de Conductores (reconocida por el Mintratel), el cual es entregado en la Dirección del Tránsito.</li>
                <li>Esta Licencia, excepcionalmente, lo habilita solamente para conducir acompañado, en el asiento delantero, 
                    de una persona en condiciones de sustituirlo eventualmente en la conducción. De acuerdo a lo establecido en el Art. 115, 
                    dicha persona debe tener una licencia que lo habilite para conducir los tipos de vehículos autorizados para la Clase B, 
                    cuya vigencia, a la fecha de un control, tenga no menos de 5 años de antigüedad.</li>
                <li>Cumplidos los 18 años de edad, este último requisito se extinguirá por el solo ministerio de la ley.</li>
              </div>`
  },
  {
    title: 'Requisitos Licencia especial D y F',
    content: `<div>
                <b>Clase D:</b>
                <br>Para conducir maquinarias automotrices como tractores, sembradoras, cosechadoras, bulldózer, palas mecánicas, palas cargadoras, aplanadoras, grúas, 
                    motoniveladoras, retroexcavadoras, traíllas y otras similares.</br>
                <br></br>
                <b><u>Requisitos:</u></b>
                <li>Ser mayor de 18 años.</li>
                <li>Saber leer y escribir.</li>
                <li>Haber realizado un curso en una escuela para maquinaria pesada.</li>
                <br></br>
                <b>Examenes a rendir:</b>
                <li>Examen Teórico.</li>
                <li>Examen Psicométrico.</li>
                <li>Examen Sensométrico.</li>
                <li>Entrevista Médica.</li>
                <li>Examen Práctico (vehículo requerido para la clase o, en su defecto, certificado de la empresa en que se desempeña, 
                    acreditando que el contribuyente maniobra el tipo de maquinaria a la cual está postulando. También sirve el certificado extendido por alguna entidad especializada, 
                    en que se demuestre que el postulante ha realizado un curso especial para el manejo de dicha maquinaria).</li>
                <br></br>
                <b>Clase F:</b>
                <br>Para conducir vehículos motorizados especiales de las Fuerzas Armadas, Carabineros de Chile, Policía de Investigaciones de Chile, de Gendarmería de Chile, 
                    del Cuerpo de Bomberos de Chile, no incluidos en las clases anteriores.</br>
                <br></br>
                <b><u>Requisitos:</u></b>
                <li>Ser funcionario de fuerzas armadas, de carabineros, investigaciones de chile, gendarmería y bomberos, y haber realizado un curso en la entidad correspondiente.</li>
                <li>Ser mayor de 18 años.</li>
                <li>Examen Psicométrico.</li>
                <li>Examen Sensométrico.</li>
                <li>Entrevista Médica.</li>
                <li>Debe traer certificado de la Institución donde presta servicios, acreditando que el postulante ha realizado 
                    satisfactoriamente los cursos correspondientes a la licencia que solicita.</li>
              </div>`
  },
  {
    title: 'a',
    content: `<div>Info
                <br></br>
                <li>Info</li>
              </div>`
  },
  {
    title: 'a',
    content: `<div>Info
                <br></br>
                <li>Info</li>
              </div>`
  },
  {
    title: 'aa',
    content: `<div>Info
                <br></br>
                <li>Info</li>
              </div>`
  },
  {
    title: 'a',
    content: `<div>Info
                <br></br>
                <li>Info</li>
              </div>`
  },
  
];

constructor(private location: Location) {}

toggle(index: number) {
  
  this.openIndex = this.openIndex === index ? -1 : index;
}

goBack(): void {
  this.location.back();
}
}
