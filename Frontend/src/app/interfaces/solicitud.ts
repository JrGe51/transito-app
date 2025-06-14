export interface Solicitud {
    id?: number;
    fechaSolicitud?: Date;
    tipoTramite?: string;
    id_usuario?: number;
    id_tipoLicencia?: number;
    id_horario?: number;
    documentos?: any[];
    // Propiedades adicionales de las relaciones
    horario?: {
        fecha: string;
        hora: string;
        cupodisponible: boolean;
    };
    tipoLicencia?: {
        name: string;
        description: string;
    };
    usuario?: {
        name: string;
        lastname: string;
        email: string;
        rut: string;
        telefono: string;
    };
} 