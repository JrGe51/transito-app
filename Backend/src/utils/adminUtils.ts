import { Admin } from "../models/admin";

export const generarEmailAdmin = (nombre: string, apellido: string): string => {

    const inicialesNombre = nombre.substring(0, 3).toLowerCase();
    

    const ultimasApellido = apellido.substring(apellido.length - 3).toLowerCase();
    

    return `${inicialesNombre}${ultimasApellido}@loespejoadmin.com`;
};

export const generarEmailUnico = async (nombre: string, apellido: string): Promise<string> => {
    let emailBase = generarEmailAdmin(nombre, apellido);
    let emailFinal = emailBase;
    let contador = 1;


    while (await Admin.findOne({ where: { email: emailFinal } })) {
        emailFinal = `${emailBase.split('@')[0]}${contador}@loespejoadmin.com`;
        contador++;
    }

    return emailFinal;
}; 