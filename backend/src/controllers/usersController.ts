import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "../db/knex";
import transporter from "../config/mailer";
import { getInvitationEmailTemplate } from "../services/emailTemplates";

// helper
const buildImageUrl = (req: Request, filePath?: string): string | null => {
    if (!filePath) return null;
    const cleaned = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return `${req.protocol}://${req.get("host")}/${cleaned}`;
};

// =============================================
// GET ALL USERS (with optional search query)
// =============================================
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q } = req.query;

        let query = db("auth_users")
            .where("owner_id", req.user.id)
            .where("is_deleted", false)
            .orderBy("created_at", "desc");

        if (q && (q as string).trim()) {
            const search = `%${(q as string).trim()}%`;
            query = query.where(function (this: any) {
                this.whereILike("name", search)
                    .orWhereILike("email", search)
                    .orWhereILike("username", search);
            });
        }

        const users = await query;

        res.status(200).json({
            status: 200,
            success: true,
            message: q
                ? `Found ${users.length} user(s) matching "${(q as string).trim()}"`
                : "Users fetch successfully",
            data: users.map((u: any) => {
                delete u.password;
                delete u.resetPasswordToken;
                delete u.resetPasswordExpire;
                u.profileImage = buildImageUrl(req, u.profileImage);
                return u;
            }),
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to fetch users",
        });
    }
};

// =============================================
// CREATE USER
// =============================================
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            name, email, phone, username, city, country,
            zipCode, bio, timezone, password, role,
        } = req.body;

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

        if (!name || !email || !password) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Name, email and password are required",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [user] = await db("auth_users").insert({
            name,
            email,
            phone,
            username,
            city,
            country,
            zip_code: zipCode,
            bio,
            timezone,
            password: hashedPassword,
            role: role || "Viewer",
            is_verified: true,
            owner_id: req.user.id,
        }).returning("*");

        delete user.password;
        delete user.resetPasswordToken;
        delete user.resetPasswordExpire;

        res.status(201).json({
            status: 201,
            success: true,
            message: "User created successfully",
            data: user,
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
            message: "Failed to create user",
        });
    }
};

// =============================================
// UPDATE USER
// =============================================
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            name, email, phone, username, city, country,
            zipCode, bio, timezone, role,
        } = req.body;

        const user = await db("auth_users").where({ id, owner_id: req.user.id }).first();
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
        if (email !== undefined) updates.email = email;
        if (phone !== undefined) updates.phone = phone;
        if (username !== undefined) updates.username = username;
        if (city !== undefined) updates.city = city;
        if (country !== undefined) updates.country = country;
        if (zipCode !== undefined) updates.zip_code = zipCode;
        if (bio !== undefined) updates.bio = bio;
        if (timezone !== undefined) updates.timezone = timezone;
        if (role !== undefined) updates.role = role;

        const [updated] = await db("auth_users").where("id", id).update(updates).returning("*");

        delete updated.password;
        delete updated.resetPasswordToken;
        delete updated.resetPasswordExpire;

        res.status(200).json({
            status: 200,
            success: true,
            message: "User updated successfully",
            data: updated,
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
            message: "Failed to update user",
        });
    }
};

// =============================================
// DELETE USER
// =============================================
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const count = await db("auth_users")
            .where({ id, owner_id: req.user.id, is_deleted: false })
            .update({ is_deleted: true, deleted_at: new Date(), updated_at: new Date() });

        if (!count) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "User not found",
            });
            return;
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to delete user",
        });
    }
};

// =============================================
// INVITE USER
// =============================================
export const inviteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, role } = req.body;

        if (!email) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Email is required",
            });
            return;
        }

        const userExists = await db("auth_users").where({ email }).first();
        if (userExists && !userExists.isDeleted) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "A user with this email already exists",
            });
            return;
        }

        const token = crypto.randomBytes(32).toString("hex");

        await db("invitations").insert({
            email,
            token,
            role: role || "Viewer",
            owner_id: req.user.id,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/register-invite/${token}`;

        await transporter.sendMail({
            from: `"CRUD App" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Invitation to join",
            html: getInvitationEmailTemplate(inviteLink),
        });

        res.status(200).json({
            status: 200,
            success: true,
            message: "Invitation sent successfully",
        });
    } catch (error) {
        console.error("Invite Error:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to send invitation",
        });
    }
};

