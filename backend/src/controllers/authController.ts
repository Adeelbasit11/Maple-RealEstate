import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../db/knex";
import transporter from "../config/mailer";
import { JWT_SECRET } from "../middleware/auth";
import {
    getVerificationEmailTemplate,
    getResetPasswordTemplate,
} from "../services/emailTemplates";

// helper function to build image url
const buildImageUrl = (req: Request, filePath?: string): string | null => {
    if (!filePath) return null;
    const cleaned = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return `${req.protocol}://${req.get("host")}/${cleaned}`;
};

// ===============================
// Registration
// ===============================
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, password } = req.body;

        const userExists = await db("auth_users").where({ email }).first();
        if (userExists) {
            if (!userExists.isDeleted) {
                res.status(400).json({
                    status: 400,
                    success: false,
                    field: "email",
                    message: "This email is already registered",
                });
                return;
            } else {
                await db("auth_users").where("id", userExists.id).delete();
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [user] = await db("auth_users")
            .insert({ name, email, phone, password: hashedPassword })
            .returning("*");

        const verifyToken = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: (process.env.VERIFY_TOKEN_EXPIRY || "1h") as any }
        );

        const verifyLink = `${process.env.VERIFY_URL}/${verifyToken}`;

        await transporter.sendMail({
            from: `"CRUD App" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Verify your email",
            html: getVerificationEmailTemplate(verifyLink),
        });

        res.status(201).json({
            status: 201,
            success: true,
            message: "Registered successfully. Please verify your email.",
        });
    } catch (error: any) {
        if (error.code === "23505") {
            res.status(400).json({
                status: 400,
                success: false,
                field: "email",
                message: "This email is already registered",
            });
            return;
        }

        res.status(500).json({
            status: 500,
            success: false,
            message: "Something went wrong",
        });
    }
};

// ===============================
// LOGIN
// ===============================
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await db("auth_users").where({ email }).where("is_deleted", false).first();
        if (!user) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Incorrect Email or Password",
            });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Incorrect Email or Password",
            });
            return;
        }

        if (!user.isVerified) {
            res.status(403).json({
                status: 403,
                success: false,
                message: "Please verify your email first",
            });
            return;
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: "24h",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            status: 200,
            success: true,
            message: "Login successful",
            data: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                stripeCustomerId: user.stripeCustomerId,
                subscriptionId: user.subscriptionId,
                subscriptionPlan: user.subscriptionPlan || "Free",
                subscriptionStatus: user.subscriptionStatus || "unpaid",
                subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
};

// ===============================
// CHECK LOGIN STATUS
// ===============================
export const checkLoginStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await db("auth_users")
            .where("id", req.user.id)
            .where("is_deleted", false)
            .first();

        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        delete user.password;
        delete user.resetPasswordToken;
        delete user.resetPasswordExpire;

        user.profileImage = buildImageUrl(req, user.profileImage);
        user.subscriptionPlan = user.subscriptionPlan || "Free";
        user.subscriptionStatus = user.subscriptionStatus || "unpaid";

        res.json(user);
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Server error",
        });
    }
};

// ===============================
// EMAIL VERIFICATION
// ===============================
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const decoded = jwt.verify(req.params.token as string, JWT_SECRET) as any;

        const user = await db("auth_users").where("id", decoded.id).where("is_deleted", false).first();

        if (!user) {
            res.redirect(
                `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?verified=false`
            );
            return;
        }

        await db("auth_users").where("id", user.id).update({ is_verified: true, updated_at: new Date() });

        res.redirect(
            `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?verified=true`
        );
    } catch (error) {
        res.redirect(
            `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?verified=false`
        );
    }
};

// ===============================
// FORGOT PASSWORD
// ===============================
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await db("auth_users").where({ email }).where("is_deleted", false).first();

        if (!user) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "Email not found",
            });
            return;
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        await db("auth_users").where("id", user.id).update({
            reset_password_token: resetToken,
            reset_password_expire: new Date(Date.now() + 3600000),
            updated_at: new Date(),
        });

        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: `"CRUD App" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Password Reset",
            html: getResetPasswordTemplate(resetLink),
        });

        res.json({
            status: 200,
            success: true,
            message: "Password reset link sent to email",
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Error sending reset email",
        });
    }
};

// ===============================
// RESET PASSWORD
// ===============================
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await db("auth_users")
            .where("reset_password_token", token)
            .where("reset_password_expire", ">", new Date())
            .where("is_deleted", false)
            .first();

        if (!user) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Invalid or expired token",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db("auth_users").where("id", user.id).update({
            password: hashedPassword,
            reset_password_token: null,
            reset_password_expire: null,
            updated_at: new Date(),
        });

        res.json({
            status: 200,
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Reset failed",
        });
    }
};

// ===============================
// VALIDATE RESET TOKEN
// ===============================
export const validateResetToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        const user = await db("auth_users")
            .where("reset_password_token", token)
            .where("reset_password_expire", ">", new Date())
            .where("is_deleted", false)
            .first();

        if (!user) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Reset link is invalid or expired",
            });
            return;
        }

        res.json({
            status: 200,
            success: true,
            message: "Token is valid",
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Token validation failed",
        });
    }
};

// ===============================
// UPDATE PROFILE
// ===============================
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, lastName, username, phone, city, country, zipCode, bio, timezone } = req.body;
        const userId = req.user.id;

        const user = await db("auth_users").where("id", userId).where("is_deleted", false).first();

        if (!user) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "User not found",
            });
            return;
        }

        const updates: Record<string, any> = { updated_at: new Date() };
        if (name !== undefined) updates.name = name;
        if (lastName !== undefined) updates.last_name = lastName;
        if (username !== undefined) updates.username = username;
        if (phone !== undefined) updates.phone = phone;
        if (city !== undefined) updates.city = city;
        if (country !== undefined) updates.country = country;
        if (zipCode !== undefined) updates.zip_code = zipCode;
        if (bio !== undefined) updates.bio = bio;
        if (timezone !== undefined) updates.timezone = timezone;
        if (req.file) updates.profile_image = `uploads/${req.file.filename}`;

        const [updated] = await db("auth_users").where("id", userId).update(updates).returning("*");

        delete updated.password;
        delete updated.resetPasswordToken;
        delete updated.resetPasswordExpire;
        updated.profileImage = buildImageUrl(req, updated.profileImage);

        res.status(200).json({
            status: 200,
            success: true,
            message: "Profile updated successfully",
            data: updated,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Error updating profile",
        });
    }
};

// ===============================
// CHANGE PASSWORD (logged-in user)
// ===============================
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Current password and new password are required",
            });
            return;
        }

        if (newPassword.length < 8) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "New password must be at least 8 characters",
            });
            return;
        }

        const user = await db("auth_users").where("id", userId).where("is_deleted", false).first();
        if (!user) {
            res.status(404).json({ status: 404, success: false, message: "User not found" });
            return;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Current password is incorrect",
            });
            return;
        }

        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "New password cannot be the same as current password",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db("auth_users").where("id", userId).update({
            password: hashedPassword,
            updated_at: new Date(),
        });

        res.status(200).json({
            status: 200,
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to change password",
        });
    }
};

// ===============================
// LOGOUT
// ===============================
export const logout = (_req: Request, res: Response): void => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
    });

    res.status(200).json({
        status: 200,
        success: true,
        message: "Logout successful",
    });
};

// ===============================
// VERIFY INVITE TOKEN
// ===============================
export const verifyInvite = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        const invitation = await db("invitations")
            .where({ token })
            .where("is_used", false)
            .where("expires_at", ">", new Date())
            .first();

        if (!invitation) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "This invitation link is invalid or has expired.",
            });
            return;
        }

        if (invitation.isAccessed) {
            const gracePeriod = 30 * 1000;
            const timeSinceAccess = Date.now() - new Date(invitation.updatedAt).getTime();

            if (timeSinceAccess > gracePeriod) {
                res.status(400).json({
                    status: 400,
                    success: false,
                    message: "This invitation link has already been accessed and expired.",
                });
                return;
            }
        }

        await db("invitations").where("id", invitation.id).update({ is_accessed: true, updated_at: new Date() });

        res.status(200).json({
            status: 200,
            success: true,
            email: invitation.email,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to verify invitation",
        });
    }
};

// ===============================
// REGISTER INVITED USER
// ===============================
export const registerInvited = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, password, phone, token } = req.body;

        const invitation = await db("invitations")
            .where({ token })
            .where("is_used", false)
            .where("expires_at", ">", new Date())
            .first();

        if (!invitation) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Invitation is invalid or expired",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db("auth_users").where({ email: invitation.email, is_deleted: true }).delete();

        await db("auth_users").insert({
            name,
            email: invitation.email,
            phone,
            password: hashedPassword,
            role: invitation.role,
            owner_id: invitation.ownerId,
            is_verified: true,
        });

        await db("invitations").where("id", invitation.id).update({ is_used: true, updated_at: new Date() });

        res.status(201).json({
            status: 201,
            success: true,
            message: "Successfully registered! You can now login.",
        });
    } catch (error) {
        console.error("Register Invited Error:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Registration failed",
        });
    }
};
