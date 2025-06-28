import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Verificar que las variables de entorno estén configuradas
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Error: EMAIL_USER o EMAIL_PASS no están configurados en el archivo .env');
}

// Crear el transporter de nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verificar la conexión
transporter.verify(function(error, success) {
    if (error) {
        console.log('Error en la configuración del correo:', error);
    } else {
        console.log('Servidor de correo listo para enviar mensajes');
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

// Función para formatear fecha de YYYY-MM-DD a DD/MM/YYYY
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        // Si no es una fecha válida, intentar parsear como string YYYY-MM-DD
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString; // Retornar original si no se puede parsear
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
};

// Función para obtener documentos requeridos según el tipo de trámite
export const getRequiredDocuments = (tipoTramite: string, tipoLicencia: string): string[] => {
    const documentos: string[] = [];
    
    // Documentos comunes para todos los trámites
    documentos.push('Cédula de identidad vigente');
    documentos.push('Certificado de antecedentes');
    
    // Documentos específicos según el tipo de trámite
    switch (tipoTramite) {
        case 'Primera Licencia':
            documentos.push('Certificado de estudios');
            documentos.push('Fotocopias de la cédula de identidad');
            break;
            
        case 'Renovación':
            documentos.push('Licencia de Conducir actual');
            documentos.push('Fotocopias de la cédula de identidad y la licencia de conducir actual');
            break;
            
        case 'Cambio de Clase':
            documentos.push('Licencia de Conducir actual');
            documentos.push('Fotocopias de la cédula de identidad y la licencia de conducir actual');
            break;
            
        default:
            // Para otros tipos de trámite, incluir documentos básicos
            documentos.push('Fotocopias de la cédula de identidad');
            break;
    }
    
    // Documentos adicionales según la clase de licencia
    if (tipoLicencia.includes('A1') || tipoLicencia.includes('A2') || tipoLicencia.includes('A3') || 
        tipoLicencia.includes('A4') || tipoLicencia.includes('A5')) {
        documentos.push('Certificado de curso en escuela profesional para conductores');
        documentos.push('Acreditar posesión de licencia Clase B durante al menos 2 años');
    }
    
    if (tipoLicencia.includes('D')) {
        documentos.push('Certificado de curso en escuela para maquinaria pesada');
    }
    
    if (tipoLicencia.includes('F')) {
        documentos.push('Certificado de la institución donde presta servicios');
    }
    
    // Documento adicional para personas de otras comunas
    documentos.push('Si viene de otra comuna: Certificado de Residencia');
    
    return documentos;
};

export const sendEmail = async ({ to, subject, html, text }: EmailOptions) => {
    try {
        console.log('Configurando envío de correo a:', to);
        console.log('Usando cuenta:', process.env.EMAIL_USER);
        
        const mailOptions = {
            from: `"Departamento de Tránsito" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text: text || ''
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.response);

        return {
            success: true,
            data: info
        };
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return {
            success: false,
            error
        };
    }
};

// Función de utilidad para crear plantillas HTML comunes
export const emailTemplates = {
    welcome: (name: string) => ({
        subject: '¡Bienvenido a Tránsito App!',
        html: `
            <h1>¡Bienvenido ${name}!</h1>
            <p>Gracias por registrarte en nuestra aplicación.</p>
            <p>Esperamos que encuentres útil nuestra plataforma.</p>
        `
    }),
    
    notification: (title: string, message: string) => ({
        subject: title,
        html: `
            <h2>${title}</h2>
            <p>${message}</p>
        `
    })
};

export const sendRecoveryEmail = async (to: string, codigo: string): Promise<void> => {
    try {
        const emailContent = `
            <h1>Recuperación de Contraseña</h1>
            <p>Tu código de recuperación es: <strong>${codigo}</strong></p>
            <p>Este código expirará en 1 hora.</p>
        `;

        await sendEmail({
            to,
            subject: 'Código de Recuperación de Contraseña',
            html: emailContent
        });
    } catch (error) {
        console.error('Error sending recovery email:', error);
        throw new Error('Error al enviar el correo de recuperación');
    }
}; 