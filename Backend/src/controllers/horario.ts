import { Request, Response, NextFunction } from 'express';
import { Horario } from '../models/horario';
import { Licencia } from '../models/licencia';
import  sequelize  from '../database/connection';

export const registerHorario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const t = await sequelize.transaction();
    try {
        const { fecha, hora, cupodisponible, name } = req.body;

        // Validar formato de fecha (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            res.status(400).json({
                msg: "Formato de fecha inválido. Use YYYY-MM-DD"
            });
            return;
        }

        // Validar formato de hora (HH:mm)
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora)) {
            res.status(400).json({
                msg: "Formato de hora inválido. Use HH:mm"
            });
            return;
        }

        // Verificar si la licencia existe
        const licencia = await Licencia.findOne({ where: { name } });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`
            });
            return;
        }

        // Verificar si ya existe un horario con la misma fecha y hora
        const horarioExistente = await Horario.findOne({
            where: {
                fecha,
                hora,
                id_tipoLicencia: licencia.id,
                cupodisponible: true
            }
        });

        if (horarioExistente) {
            res.status(400).json({
                msg: `Ya existe un horario para la fecha ${fecha} y hora ${hora} para la licencia ${name}`
            });
            return;
        }

        // Crear el nuevo horario
        await Horario.create({
            fecha,
            hora,
            cupodisponible: true,
            id_tipoLicencia: licencia.id
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            msg: `Horario para ${fecha} a las ${hora} creado exitosamente.`
        });
    } catch (error) {
        await t.rollback();
        console.error('Error al registrar horario:', error);
        res.status(500).json({
            msg: "Error al registrar el horario",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}

export const getFechasDisponibles = async (req: Request, res: Response) => {
    try {
        const { name } = req.query; // Obtener el nombre de la licencia de los query params

        if (!name || typeof name !== 'string') {
            res.status(400).json({
                msg: "Nombre de licencia es requerido como query parameter"
            });
            return;
        }

        // Verificar si la licencia existe
        const licencia = await Licencia.findOne({ where: { name } });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`
            });
            return;
        }

        // Busca fechas con cupo disponible para la licencia especificada
        const fechas = await Horario.findAll({
            where: {
                cupodisponible: true,
                id_tipoLicencia: licencia.id // Filtrar por ID de licencia
            },
            attributes: ['fecha'],
            group: ['fecha'],
            order: [['fecha', 'ASC']]
        });

        // Filtrar fechas futuras, con esto las fechas pasadas no se muestran
        const hoy = new Date();
        // Ajustar hoy al inicio del día para comparar correctamente con fechas (YYYY-MM-DD)
        hoy.setHours(0, 0, 0, 0);

        const fechasFiltradas = fechas
            .map(f => f.fecha)
            .filter(fecha => new Date(fecha).setHours(0,0,0,0) >= hoy.getTime()); // Comparar timestamps al inicio del día

        res.json(fechasFiltradas);
    } catch (error) {
        console.error('Error al obtener fechas:', error);
        res.status(500).json({ 
            msg: "Error al obtener fechas", 
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const getHorasPorFecha = async (req: Request, res: Response): Promise<void> => {
    try {
        // Asegúrate de que fecha y name sean strings
        let fechaStr: string | undefined;
        let name: string | undefined;

        if (typeof req.query.fecha === 'string') {
            fechaStr = req.query.fecha;
        } else if (Array.isArray(req.query.fecha) && req.query.fecha.length > 0 && typeof req.query.fecha[0] === 'string') {
            fechaStr = req.query.fecha[0];
        }
        
        if (typeof req.query.name === 'string') {
            name = req.query.name;
        } else if (Array.isArray(req.query.name) && req.query.name.length > 0 && typeof req.query.name[0] === 'string') {
            name = req.query.name[0];
        }

        if (!fechaStr || !name) {
            res.status(400).json({ msg: "Fecha y nombre de licencia son requeridos como query parameters" });
            return;
        }

        // Validar formato de fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
            res.status(400).json({
                msg: "Formato de fecha inválido. Use YYYY-MM-DD"
            });
            return;
        }

        // Verificar que la fecha no sea en el pasado (solo para horas de fechas pasadas completas)
        const fechaObj = new Date(fechaStr);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Ajustar hoy al inicio del día

        if (fechaObj.setHours(0,0,0,0) < hoy.getTime()) { // Comparar timestamps al inicio del día
             res.status(400).json({
                 msg: "No se pueden consultar horarios de fechas pasadas completas"
             });
             return;
        }

        // Encontrar la licencia por nombre
        const licencia = await Licencia.findOne({ where: { name } });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`
            });
            return;
        }

        const horas = await Horario.findAll({
            where: { 
                fecha: fechaStr, 
                cupodisponible: true,
                id_tipoLicencia: licencia.id // Filtrar por ID de licencia
            },
            attributes: ['hora'],
            order: [['hora', 'ASC']]
        });

        // Formatear las horas a HH:mm antes de enviarlas
        res.json(horas.map(h => h.hora.substring(0, 5)));
    } catch (error) {
        console.error('Error al obtener horas:', error);
        res.status(500).json({ 
            msg: "Error al obtener horas", 
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const liberarHorario = async (req: Request, res: Response): Promise<void> => {
    const t = await sequelize.transaction();
    try {
        const { fecha, hora, name } = req.body;

        // Validar datos de entrada
        if (!fecha || !hora || !name) {
            res.status(400).json({ msg: "Fecha, hora y nombre de licencia son requeridos" });
            return;
        }

         // Validar formato de fecha (YYYY-MM-DD)
         if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            res.status(400).json({
                msg: "Formato de fecha inválido. Use YYYY-MM-DD"
            });
            return;
        }

        // Validar formato de hora (HH:mm)
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora)) {
            res.status(400).json({
                msg: "Formato de hora inválido. Use HH:mm"
            });
            return;
        }

        // Encontrar la licencia por nombre
        const licencia = await Licencia.findOne({ where: { name } });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`
            });
            return;
        }

        // Encontrar el horario específico que NO esté disponible (false)
        const horario = await Horario.findOne({
            where: {
                fecha,
                hora,
                id_tipoLicencia: licencia.id,
                cupodisponible: false // Solo liberar horarios que ya están ocupados
            }
        });

        if (!horario) {
            res.status(404).json({
                msg: `No se encontró un horario ocupado para la fecha ${fecha}, hora ${hora} y licencia ${name}.`
            });
            return;
        }

        // Actualizar cupodisponible a true
        horario.cupodisponible = true;
        await horario.save({ transaction: t });

        await t.commit();

        res.json({
            msg: `Horario para ${fecha} a las ${hora} (Licencia: ${name}) liberado exitosamente.`
        });

    } catch (error) {
        await t.rollback();
        console.error('Error al liberar horario:', error);
        res.status(500).json({
            msg: "Error al liberar el horario",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const getAllHorarios = async (req: Request, res: Response): Promise<void> => {
    try {
        const horarios = await Horario.findAll({
            include: [{
                model: Licencia,
                attributes: ['name'] // Incluir solo el nombre de la licencia
            }],
            attributes: ['fecha', 'hora', 'cupodisponible'], // Seleccionar solo los campos relevantes
            order: [['fecha', 'ASC'], ['hora', 'ASC']]
        });

        // Mapear los resultados para incluir el nombre de la licencia directamente
        const formattedHorarios = horarios.map(horario => ({
            id: horario.id, // Incluir el ID para futuras operaciones (eliminar)
            fecha: horario.fecha,
            hora: horario.hora.substring(0, 5), // Formatear hora a HH:mm
            cupodisponible: horario.cupodisponible,
            licenciaName: (horario as any).licencia ? (horario as any).licencia.name : 'N/A'
        }));

        res.json(formattedHorarios);
    } catch (error) {
        console.error('Error al obtener todos los horarios:', error);
        res.status(500).json({
            msg: "Error al obtener todos los horarios",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};