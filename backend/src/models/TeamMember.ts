import mongoose, { Schema, Document } from "mongoose";

export interface ITeamMember extends Document {
    name: string;
    email: string;
    phone?: string;
    username?: string;
    city?: string;
    country?: string;
    zipCode?: string;
    bio?: string;
    timezone?: string;
    profileImage?: string;
    role: "SuperAdmin" | "Admin" | "Editor" | "Viewer";
    isVerified: boolean;
    isDeleted: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: false,
        },
        username: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
        zipCode: {
            type: String,
            required: false,
        },
        bio: {
            type: String,
            required: false,
        },
        timezone: {
            type: String,
            required: false,
        },
        profileImage: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            enum: ["SuperAdmin", "Admin", "Editor", "Viewer"],
            default: "Viewer",
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model<ITeamMember>("TeamMember", teamMemberSchema);
