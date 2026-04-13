import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import AuthUser from "../models/AuthUser";
import Invitation from "../models/Invitation";
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
        const baseFilter = {
            ownerId: req.user.id,
            isDeleted: { $ne: true },
        };

        // If search query exists, add search criteria
        let filter: any = baseFilter;
        if (q && (q as string).trim()) {
            const regex = new RegExp((q as string).trim(), "i");
            filter = {
                ...baseFilter,
                $or: [
                    { name: regex },
                    { email: regex },
                    { username: regex },
                ],
            };
        }

        const users = await AuthUser.find(filter)
            .select("-password -resetPasswordToken -resetPasswordExpire")
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 200,
            success: true,
            message: q 
                ? `Found ${users.length} user(s) matching "${(q as string).trim()}"` 
                : "Users fetch successfully",
            data: users.map((u) => {
                const obj = u.toObject();
                (obj as any).profileImage = buildImageUrl(req, obj.profileImage);
                return obj;
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

        const userExists = await AuthUser.findOne({ email });
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
                await AuthUser.findByIdAndDelete(userExists._id);
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

        const user = new AuthUser({
            name,
            email,
            phone,
            username,
            city,
            country,
            zipCode,
            bio,
            timezone,
            password: hashedPassword,
            role: role || "Viewer",
            isVerified: true,
            ownerId: req.user.id,
        });

        await user.save();

        const obj: any = user.toObject();
        delete obj.password;
        delete obj.resetPasswordToken;
        delete obj.resetPasswordExpire;

        res.status(201).json({
            status: 201,
            success: true,
            message: "User created successfully",
            data: obj,
        });
    } catch (error: any) {
        if (error.code === 11000) {
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

        const user = await AuthUser.findOne({ _id: id, ownerId: req.user.id });
        if (!user) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "User not found",
            });
            return;
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (username !== undefined) user.username = username;
        if (city !== undefined) user.city = city;
        if (country !== undefined) user.country = country;
        if (zipCode !== undefined) user.zipCode = zipCode;
        if (bio !== undefined) user.bio = bio;
        if (timezone !== undefined) user.timezone = timezone;
        if (role !== undefined) user.role = role;

        await user.save();

        const obj: any = user.toObject();
        delete obj.password;
        delete obj.resetPasswordToken;
        delete obj.resetPasswordExpire;

        res.status(200).json({
            status: 200,
            success: true,
            message: "User updated successfully",
            data: obj,
        });
    } catch (error: any) {
        if (error.code === 11000) {
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

        const user = await AuthUser.findOneAndUpdate(
            { _id: id, ownerId: req.user.id, isDeleted: { $ne: true } },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!user) {
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

        const userExists = await AuthUser.findOne({ email });
        if (userExists) {
            if (!userExists.isDeleted) {
                res.status(400).json({
                    status: 400,
                    success: false,
                    message: "A user with this email already exists",
                });
                return;
            }
        }

        const token = crypto.randomBytes(32).toString("hex");

        const invitation = new Invitation({
            email,
            token,
            role: role || "Viewer",
            ownerId: req.user.id,
        });
        await invitation.save();

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

