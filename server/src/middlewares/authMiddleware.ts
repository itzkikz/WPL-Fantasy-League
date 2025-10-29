import { NextFunction, Request, Response } from "express";
import fs from "fs";


declare global {
    namespace Express {
        interface Request {
            user?: any; // or specify a more precise type if known
        }
    }
}
import jwt from 'jsonwebtoken'
const KEY = process.env.SECRET_KEY;
const publicKey = fs.readFileSync("./keys/public.key", "utf8");


// Middleware to verify JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({data: { valid: false }});

    jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (err, user) => {
        if (err) return res.status(403).json({data : { valid: false }});
        req.user = user;
        next();
    });
}