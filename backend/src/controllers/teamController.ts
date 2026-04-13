import { Request, Response } from "express";
import TeamMember from "../models/TeamMember";

// helper
const buildImageUrl = (req: Request, filePath?: string): string | null => {
    if (!filePath) return null;
    const cleaned = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return `${req.protocol}://${req.get("host")}/${cleaned}`;
};

// =============================================
// GET ALL TEAM MEMBERS (with optional search query)
// =============================================
export const getAllTeamMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q } = req.query;
        const baseFilter = {
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

        const members = await TeamMember.find(filter).sort({
            createdAt: -1,
        });

        res.status(200).json({
            status: 200,
            success: true,
            message: q 
                ? `Found ${members.length} team member(s) matching "${(q as string).trim()}"`
                : "Team members fetch successfully",
            data: members.map((m) => {
                const obj = m.toObject();
                (obj as any).profileImage = buildImageUrl(req, obj.profileImage);
                return obj;
            }),
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to fetch team members",
        });
    }
};

// =============================================
// CREATE TEAM MEMBER
// =============================================
export const createTeamMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            name, email, phone, username, city, country,
            zipCode, bio, timezone, role,
        } = req.body;

        const memberExists = await TeamMember.findOne({ email });
        if (memberExists) {
            if (!memberExists.isDeleted) {
                res.status(400).json({
                    status: 400,
                    success: false,
                    field: "email",
                    message: "This email is already registered in team",
                });
                return;
            } else {
                await TeamMember.findByIdAndDelete(memberExists._id);
            }
        }

        if (!name || !email) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Name and email are required",
            });
            return;
        }

        const member = new TeamMember({
            name,
            email,
            phone,
            username,
            city,
            country,
            zipCode,
            bio,
            timezone,
            role: role || "Viewer",
            isVerified: true,
        });

        await member.save();

        const obj = member.toObject();

        res.status(201).json({
            status: 201,
            success: true,
            message: "Team member created successfully",
            data: obj,
        });
    } catch (error: any) {
        console.error("Create Team Member Error:", error);
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
            message: "Failed to create team member",
        });
    }
};

// =============================================
// UPDATE TEAM MEMBER
// =============================================
export const updateTeamMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            name, email, phone, username, city, country,
            zipCode, bio, timezone, role,
        } = req.body;

        const member = await TeamMember.findOne({ _id: id, isDeleted: { $ne: true } });
        if (!member) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "Team member not found",
            });
            return;
        }

        if (name !== undefined) member.name = name;
        if (email !== undefined) member.email = email;
        if (phone !== undefined) member.phone = phone;
        if (username !== undefined) member.username = username;
        if (city !== undefined) member.city = city;
        if (country !== undefined) member.country = country;
        if (zipCode !== undefined) member.zipCode = zipCode;
        if (bio !== undefined) member.bio = bio;
        if (timezone !== undefined) member.timezone = timezone;
        if (role !== undefined) member.role = role;

        await member.save();

        const obj = member.toObject();

        res.status(200).json({
            status: 200,
            success: true,
            message: "Team member updated successfully",
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
            message: "Failed to update team member",
        });
    }
};

// =============================================
// DELETE TEAM MEMBER
// =============================================
export const deleteTeamMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const member = await TeamMember.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!member) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "Team member not found",
            });
            return;
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Team member deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to delete team member",
        });
    }
};

