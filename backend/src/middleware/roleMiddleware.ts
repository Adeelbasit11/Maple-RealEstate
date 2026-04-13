import { Request, Response, NextFunction } from "express";

const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !req.user.role) {
            res.status(401).json({
                status: 401,
                success: false,
                message: "Unauthorized: No role found",
            });
            return;
        }

        if (req.user.role === "SuperAdmin") {
            return next();
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                status: 403,
                success: false,
                message: `Forbidden: You do not have permission to perform this action. Required roles: ${allowedRoles.join(", ")}`,
            });
            return;
        }

        next();
    };
};

export default authorize;
