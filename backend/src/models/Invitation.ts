import mongoose, { Schema, Document } from "mongoose";

export interface IInvitation extends Document {
    email: string;
    token: string;
    ownerId: mongoose.Types.ObjectId;
    isUsed: boolean;
    isAccessed: boolean;
    expiresAt: Date;
    role: "Admin" | "Editor" | "Viewer";
    createdAt: Date;
    updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
    {
        email: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "AuthUser",
            required: true,
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
        isAccessed: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        role: {
            type: String,
            enum: ["Admin", "Editor", "Viewer"],
            default: "Viewer",
        },
    },
    { timestamps: true }
);

export default mongoose.model<IInvitation>("Invitation", invitationSchema);
