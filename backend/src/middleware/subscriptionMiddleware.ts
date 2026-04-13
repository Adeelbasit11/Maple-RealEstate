import { Request, Response, NextFunction } from "express";

export const requireSubscription = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (user.subscriptionStatus !== "active" && user.subscriptionStatus !== "trialing" && user.role !== "SuperAdmin") {
        return res.status(403).json({
            success: false,
            message: "Active subscription required. Please upgrade your plan.",
        });
    }

    next();
};
