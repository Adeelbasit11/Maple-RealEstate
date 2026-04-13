import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AuthUser from "../models/AuthUser";

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

        const user = await AuthUser.findById(verified.id).select("-password");

        if (!user) {
            res.status(401).json({
                status: 401,
                success: false,
                message: "User not found",
            });
            return;
        }

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
