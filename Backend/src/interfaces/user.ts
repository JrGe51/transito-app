export interface User {
    id?: number;
    name?: string;
    rut?: string;
    lastname?: string;
    email: string;
    password: string;
    telefono?: string;
    fechanacimiento?: string;
    direccion?: string;
    codigoRecuperacion?: string;
    codigoExpiracion?: Date;
    licenciaVigente?: string[];
    examenMedicoAprobado?: boolean;
    examenPracticoAprobado?: boolean;
    examenTeoricoAprobado?: boolean;
    examenPsicotecnicoAprobado?: boolean;
}
