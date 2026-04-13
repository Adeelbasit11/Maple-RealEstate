import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import AuthUser from "../models/AuthUser";
import Invitation from "../models/Invitation";
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new AuthUser({
            name,
            email,
            phone,
            password: hashedPassword,
        });

        await user.save();

        const verifyToken = jwt.sign(
            { id: user._id.toString(), role: user.role },
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

        const user = await AuthUser.findOne({ email, isDeleted: { $ne: true } });
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

        const token = jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, {
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
                _id: user._id,
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
        const user = await AuthUser.findOne({
            _id: req.user.id,
            isDeleted: { $ne: true },
        }).select("-password -resetPasswordToken -resetPasswordExpire");

        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        const userObj = user.toObject ? user.toObject() : user;
        (userObj as any).profileImage = buildImageUrl(req, (userObj as any).profileImage);
        
        // Ensure subscription fields have default values if not set (for old users who don't have these fields in DB)
        (userObj as any).subscriptionPlan = (userObj as any).subscriptionPlan || "Free";
        (userObj as any).subscriptionStatus = (userObj as any).subscriptionStatus || "unpaid";
        
        res.json(userObj);
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

        const user = await AuthUser.findOne({ _id: decoded.id, isDeleted: { $ne: true } });

        if (!user) {
            res.redirect(
                `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?verified=false`
            );
            return;
        }

        user.isVerified = true;
        await user.save();

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

        const user = await AuthUser.findOne({ email, isDeleted: { $ne: true } });

        if (!user) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "Email not found",
            });
            return;
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = new Date(Date.now() + 3600000);

        await user.save();

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

        const user = await AuthUser.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() },
            isDeleted: { $ne: true },
        });

        if (!user) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Invalid or expired token",
            });
            return;
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

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

        const user = await AuthUser.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() },
            isDeleted: { $ne: true },
        });

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
        const { name, username, phone, city, country, zipCode, bio, timezone } = req.body;
        const userId = req.user.id;

        const user = await AuthUser.findOne({ _id: userId, isDeleted: { $ne: true } });

        if (!user) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "User not found",
            });
            return;
        }

        if (name) user.name = name;
        if (username) user.username = username;
        if (phone) user.phone = phone;
        if (city) user.city = city;
        if (country) user.country = country;
        if (zipCode) user.zipCode = zipCode;
        if (bio) user.bio = bio;
        if (timezone) user.timezone = timezone;

        if (req.file) {
            user.profileImage = `uploads/${req.file.filename}`;
        }

        await user.save();

        res.status(200).json({
            status: 200,
            success: true,
            message: "Profile updated successfully",
            data: {
                name: user.name,
                email: user.email,
                username: user.username,
                phone: user.phone,
                city: user.city,
                country: user.country,
                zipCode: user.zipCode,
                bio: user.bio,
                timezone: user.timezone,
                profileImage: buildImageUrl(req, user.profileImage),
            },
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

        const invitation = await Invitation.findOne({
            token,
            isUsed: false,
            expiresAt: { $gt: Date.now() },
        });

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
            const timeSinceAccess = Date.now() - invitation.updatedAt.getTime();

            if (timeSinceAccess > gracePeriod) {
                res.status(400).json({
                    status: 400,
                    success: false,
                    message: "This invitation link has already been accessed and expired.",
                });
                return;
            }
        }

        invitation.isAccessed = true;
        await invitation.save();

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

        const invitation = await Invitation.findOne({
            token,
            isUsed: false,
            expiresAt: { $gt: Date.now() },
        });

        if (!invitation) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Invitation is invalid or expired",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await AuthUser.findOneAndDelete({ email: invitation.email, isDeleted: true });

        const newUser = new AuthUser({
            name,
            email: invitation.email,
            phone,
            password: hashedPassword,
            role: invitation.role,
            ownerId: invitation.ownerId,
            isVerified: true,
        });

        await newUser.save();

        invitation.isUsed = true;
        await invitation.save();

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
