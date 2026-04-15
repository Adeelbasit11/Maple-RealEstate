import { Request, Response } from "express";
import db from "../db/knex";

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

        let query = db("team_members")
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

        const members = await query;

        res.status(200).json({
            status: 200,
            success: true,
            message: q
                ? `Found ${members.length} team member(s) matching "${(q as string).trim()}"`
                : "Team members fetch successfully",
            data: members.map((m: any) => {
                m.profileImage = buildImageUrl(req, m.profileImage);
                return m;
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

        const memberExists = await db("team_members").where({ email }).first();
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
                await db("team_members").where("id", memberExists.id).delete();
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

        const [member] = await db("team_members").insert({
            name,
            email,
            phone,
            username,
            city,
            country,
            zip_code: zipCode,
            bio,
            timezone,
            role: role || "Viewer",
            is_verified: true,
        }).returning("*");

        res.status(201).json({
            status: 201,
            success: true,
            message: "Team member created successfully",
            data: member,
        });
    } catch (error: any) {
        console.error("Create Team Member Error:", error);
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

        const member = await db("team_members").where({ id, is_deleted: false }).first();
        if (!member) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "Team member not found",
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

        const [updated] = await db("team_members").where("id", id).update(updates).returning("*");

        res.status(200).json({
            status: 200,
            success: true,
            message: "Team member updated successfully",
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

        const count = await db("team_members")
            .where({ id, is_deleted: false })
            .update({ is_deleted: true, deleted_at: new Date(), updated_at: new Date() });

        if (!count) {
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

