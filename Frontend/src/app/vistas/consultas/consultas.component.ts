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
    title: 'Requisitos Licencias Profesionales A1, A2, A3, A4 y A5',
    content: `<div>
                <b>Transporte de pasajeros:</b>
                <br></br>
                <div><li><b>Clase A1/A2</b></li></div>
                <div><b>Clase A1:</b>Lo habilita para conducir taxis.</div>
                <div><b>Clase A2:</b>Para conducir indistintamente taxis, colectivos, ambulancias o vehículos motorizados de transporte público y privado de personas, 
                      con capacidad de 10 a 17 asientos.</div>
                <div><li><b>Clase A3</b></li></div>
                <div>Para conducir indistintamente taxis, transporte escolar, ambulancias o vehículos motorizados de transporte público y privado de personas, 
                      sin limitación de capacidad de asientos.</div>
                <br></br>
                <b>Transporte de Carga:</b>
                <br></br>
                <div><li><b>Clase A4/A5</b></li></div>
                <div><b>Clase A4:</b>Para conducir vehículos simples destinados al transporte de carga, cuyo peso bruto vehicular sea superior a 3.500 Kilogramos.</div>
                <div><b>Clase A5:</b>Para conducir todo tipo de vehículos motorizados, simples o articulados, 
                      destinados al transporte de carga, cuyo peso bruto vehicular sea superior a 3.500 Kilogramos.</div>
                <br></br>
                <b><u>Requisitos:</u></b>
                <li>Profesional clases <b>A1/A2/A3/A4/A5</b> con <b>curso realizado en una escuela profesional para conductores</b>.</li>
                <li>Tener como mínimo 20 años de edad.</li>
                <li>Acreditar haber estado en posesión de la licencia Clase B durante dos años.</li>
                <li>Acreditar, en caso de la Clase A-3, haber estado en posesión, durante a lo menos dos años, de la Licencia Profesional Clases A-1, A-2, A-4 o A-5. 
                      Tratándose de la Clase A-5, los postulantes deberán acreditar haber estado en posesión, durante a lo menos dos años, 
                      de la licencia profesional clases A-2, A-3 o A-4.</li>
                <br></br>
                <b>Examenes a rendir:</b>
                <li>Examen Teórico.</li>
                <li>Examen Psicosensometrico.</li>
                <li>Examen Médico.</li>
              </div>`
  },
  {
    title: 'Controles según licencia de conducir',
    content: `<div>
                <b>LICENCIA NO PROFESIONAL</b>
                <br></br>
                <b>Clase: B, C, D, F.</b>
                <li>Cada 6 años el conductor deberá someterse a un examen psicosensométrico en el Departamento de Licencias, 
                    a través del cual se evaluará la idoneidad física y mental del postulante.</li>
                <li>La idoneidad moral será evaluada por el Director de Tránsito, teniendo a la vista el Certificado de Antecedentes, y la idoneidad física por el médico del departamento. 
                    Si la licencia es denegada por idoneidad moral, el postulante puede apelar al Juzgado de Policía Local, y si se denegare por un médico, 
                    el afectado tiene la posibilidad de apelar ante el Servicio Médico Legal.</li>
                <br></br>
                <b>LICENCIAS PROFESIONALES LEY 18.290 (A1-A2, antes del 08 de Marzo de 1997)</b>
                <br></br>
                <li>Cada 4 años deben someterse a control y realizar examen teórico, sensométrico y psicométrico. Los contribuyentes en posesión de estas licencias. 
                    (Según Ley Nº 18.290, modificada por la Ley Nº 20.068 del 15 de diciembre de 2005, lo que aumenta de 2 a 4 años la vigencia de estas licencias).</li>
                <br></br>
                <b>LICENCIAS PROFESIONALES A LEY 19.495</b>
                <br></br>
                <li>Contribuyentes que hayan obtenido licencia  Clase A1-A2-A3-A4-A5, Ley N° 19.495 profesional, 
                    Cada 4 años deben someterse a control y realizar examen médico, sensométrico y psicométrico.</li>
              </div>`
  },
  {
    title: 'Duplicado (no requiere cupo de atención)',
    content: `<div>El Duplicado se podrá solicitar directamente en el Departamento de Licencias de Conducir de martes a sábado entre las 8:30 y 13:00 hrs. 
                y en la tarde de 15:15 a 17:00. Día vienes 8:30 y 13:00 hrs. y en la tarde de 15:15 a 16:00 hrs.
                <br></br>
                <div>Deben presentar bloqueo definitivo de licencia de conducir, trámite que se realiza en forma presencia en el Registro Civil.</div>
                <br></br>
                <b>Requisitos:</b>
                <li>Cédula de identidad vigente, o papeleta de retiro de su nueva cédula emitida por Registro Civil.</li>
                <li>Fotocopia simple de cédula de identidad por ambos lados.</li>
                <li>Bloqueo de la licencia de conductor en el Registro Civil impreso.</li>
                <br></br>
                <div>La entrega del duplicado en la situación de contar con licencia de otra comuna será en el momento de la recepción de los antecedentes de la comuna de origen. 
                Se recomienda realizar cambio de domicilio en forma oportuna.</div>
              </div>`
  },
  {
    title: 'Sobre prorrogas de licencias de conducir vencidas',
    content: `<div>El 16 de junio de 2023 se publicó en el Diario Oficial la Ley Nº 21.579 que prorroga la vigencia de las licencias de conducir que se indican hasta el año 2024. 
                  En su artículo 7°, la ley dice que "Prorrógase por dos años, contados desde la fecha de vencimiento consignada en el documento, la vigencia de todas las licencias 
                  de conductor cuyo control corresponda realizar originalmente los años 2023 y 2024. Las licencias no profesionales clase B, C o especiales cuyo control corresponda 
                  realizar originalmente durante los años 2020, 2021, 2022, 2023 y 2024, se renovarán por el plazo que resta conforme lo establecido en el artículo 19, 
                  contado desde la fecha de vencimiento consignada en el documento. Para el caso de las licencias profesionales y aquellas que se hayan otorgado conforme al inciso 
                  final del artículo 22, su renovación se otorgará por el término que corresponda de acuerdo con las reglas generales.
                <br></br>
                <div>Ejemplo: Si su fecha de control era el 5 de marzo de 2024, su licencia vence el 5 de marzo de 2025, 
                    lo que quiere decir es que usted debe renovar su licencia antes de esa fecha.</div>
                <br></br>
                <a href="https://www.bcn.cl/leychile/navegar?idNorma=1193517">https://www.bcn.cl/leychile/navegar?idNorma=1193517</a>
                
              </div>`
  },
  {
    title: 'Sobre la Ley de Tránsito',
    content: `<div>La Ley de Tránsito N° 18.290, establece las normas que regulan el tránsito de vehículos y personas en las vías públicas del país.
                Esta ley es fundamental para garantizar la seguridad vial y el orden en las carreteras y calles de Chile.
                <br></br>
                <a href="https://www.bcn.cl/leychile/navegar?idNorma=30468">https://www.bcn.cl/leychile/navegar?idNorma=30468</a>
              </div>`
  }
  
];

constructor(private location: Location) {}

toggle(index: number) {
  
  this.openIndex = this.openIndex === index ? -1 : index;
}

goBack(): void {
  this.location.back();
}
}
