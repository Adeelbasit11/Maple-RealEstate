import mongoose, { Schema, Document } from "mongoose";

export interface IAuthUser extends Document {
    name: string;
    email: string;
    phone?: number;
    username?: string;
    city?: string;
    country?: string;
    zipCode?: string;
    bio?: string;
    timezone?: string;
    profileImage?: string;
    password: string;
    role: "SuperAdmin" | "Admin" | "Editor" | "Viewer";
    isVerified: boolean;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    ownerId?: mongoose.Types.ObjectId;
    stripeCustomerId?: string;
    subscriptionId?: string;
    subscriptionPlan?: "Basic" | "Pro" | "Enterprise" | "Free";
    subscriptionStatus?: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid";
    subscriptionCurrentPeriodEnd?: Date;
    isDeleted: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const authUserSchema = new Schema<IAuthUser>(
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
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["SuperAdmin", "Admin", "Editor", "Viewer"],
            default: "Viewer",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "AuthUser",
            required: false,
        },
        stripeCustomerId: {
            type: String,
            required: false,
        },
        subscriptionId: {
            type: String,
            required: false,
        },
        subscriptionPlan: {
            type: String,
            enum: ["Basic", "Pro", "Enterprise", "Free"],
            default: "Free",
        },
        subscriptionStatus: {
            type: String,
            enum: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "trialing", "unpaid"],
            default: "unpaid",
        },
        subscriptionCurrentPeriodEnd: {
            type: Date,
            required: false,
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

export default mongoose.model<IAuthUser>("AuthUser", authUserSchema);
