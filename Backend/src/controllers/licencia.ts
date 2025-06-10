import { Request, Response } from 'express';
import { Licencia } from '../models/licencia';

export const registerLicencia = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;

        // Validar campos requeridos
        if (!name || !description) {
            res.status(400).json({ msg: 'Todos los campos son obligatorios (name, description).' });
            return;
        }

        // Verificar duplicados
        const existe = await Licencia.findOne({ where: { name } });
        if (existe) {
            res.status(409).json({ msg: `Ya existe una licencia con el nombre '${name}'.` });
            return;
        }

        await Licencia.create({ name, description });
        res.json({ msg: `Licencia ${name} creada exitosamente.` });
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear la licencia', error });
    }
};

export const getAllLicencias = async (req: Request, res: Response) => {
    try {
        const licencias = await Licencia.findAll();
        res.json(licencias);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener licencias', error });
    }
};

export const deleteLicencia = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const licencia = await Licencia.findByPk(id);
        if (!licencia) {
            res.status(404).json({ msg: `No existe una licencia con el id ${id}` });
            return;
        }
        await licencia.destroy();
        res.json({ msg: 'Licencia eliminada con éxito!' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar licencia', error });
    }
};

