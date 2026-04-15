import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../db/knex";

export const JWT_SECRET: string = process.env.JWT_SECRET as string;

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({
            status: 401,
            success: false,
            message: "Access denied",
        });
        return;
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

        const user = await db("auth_users")
            .where("id", verified.id)
            .where("is_deleted", false)
            .first();

        if (!user) {
            res.status(401).json({
                status: 401,
                success: false,
                message: "User not found",
            });
            return;
        }

        delete user.password;
        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({
            status: 400,
            success: false,
            message: "Invalid token",
        });
    }
};
