import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ msg: 'Token requerido' });
    return;
  }

  jwt.verify(token, process.env.SECRET_KEY || 'TSE-Dylan-Hernandez', (err, user: any) => {
    if (err) {
      res.status(403).json({ msg: 'Token inválido' });
      return;
    }
    (req as any).userId = user.id;
    next();
  });
};