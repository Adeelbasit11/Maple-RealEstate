import { Request, Response } from "express";
import db from "../db/knex";

// helper
const buildImageUrl = (req: Request, filePath?: string): string | null => {
    if (!filePath) return null;
    const cleaned = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return `${req.protocol}://${req.get("host")}/${cleaned}`;
};

// =============================================
// GET ALL PRODUCTS (with optional search query)
// =============================================
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q } = req.query;

        let query = db("products")
            .where("owner_id", req.user.id)
            .where("is_deleted", false)
            .orderBy("created_at", "desc");  

        if (q && (q as string).trim()) {
            const search = `%${(q as string).trim()}%`;
            query = query.where(function (this: any) {
                this.whereILike("name", search)
                    .orWhereILike("category", search)
                    .orWhereILike("sku", search);
            });
        }

        const products = await query;

        res.status(200).json({
            status: 200,
            success: true,
            message: q
                ? `Found ${products.length} product(s) matching "${(q as string).trim()}"`
                : "Products fetched successfully",
            data: products.map((p: any) => {
                p.image = buildImageUrl(req, p.image);
                return p;
            }),
        });
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to fetch products",
        });
    }
};

// =============================================
// GET SINGLE PRODUCT
// =============================================
export const getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const product = await db("products")
            .where({ id, owner_id: req.user.id, is_deleted: false })
            .first();

        if (!product) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "Product not found",
            });
            return;
        }

        product.image = buildImageUrl(req, product.image);

        res.status(200).json({
            status: 200,
            success: true,
            message: "Product fetched successfully",
            data: product,
        });
    } catch (error) {
        console.error("Get Product Error:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to fetch product",
        });
    }
};

// =============================================
// CREATE PRODUCT
// =============================================
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            name, weight, size, category, description,
            facebookAccount, instagramAccount, linkedinAccount,
            dribbbleAccount, behanceAccount, ui8Account,
            price, currency, sku, tags, quantity, status,
        } = req.body;

        if (!name) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Product name is required",
            });
            return;
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const [product] = await db("products").insert({
            name,
            weight,
            size,
            category,
            description,
            image: imagePath,
            facebook_account: facebookAccount,
            instagram_account: instagramAccount,
            linkedin_account: linkedinAccount,
            dribbble_account: dribbbleAccount,
            behance_account: behanceAccount,
            ui8_account: ui8Account,
            price: price ? parseFloat(price) : 0,
            currency: currency || "USD",
            sku,
            tags,
            quantity: quantity ? parseInt(quantity) : 0,
            status: status || "In Stock",
            owner_id: req.user.id,
        }).returning("*");

        product.image = buildImageUrl(req, product.image);

        res.status(201).json({
            status: 201,
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to create product",
        });
    }
};

// =============================================
// UPDATE PRODUCT
// =============================================
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            name, weight, size, category, description,
            facebookAccount, instagramAccount, linkedinAccount,
            dribbbleAccount, behanceAccount, ui8Account,
            price, currency, sku, tags, quantity, status,
        } = req.body;

        const product = await db("products").where({ id, owner_id: req.user.id, is_deleted: false }).first();
        if (!product) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "Product not found",
            });
            return;
        }

        const updates: Record<string, any> = { updated_at: new Date() };
        if (name !== undefined) updates.name = name;
        if (weight !== undefined) updates.weight = weight;
        if (size !== undefined) updates.size = size;
        if (category !== undefined) updates.category = category;
        if (description !== undefined) updates.description = description;
        if (facebookAccount !== undefined) updates.facebook_account = facebookAccount;
        if (instagramAccount !== undefined) updates.instagram_account = instagramAccount;
        if (linkedinAccount !== undefined) updates.linkedin_account = linkedinAccount;
        if (dribbbleAccount !== undefined) updates.dribbble_account = dribbbleAccount;
        if (behanceAccount !== undefined) updates.behance_account = behanceAccount;
        if (ui8Account !== undefined) updates.ui8_account = ui8Account;
        if (price !== undefined) {
            const parsedPrice = parseFloat(price);
            updates.price = isNaN(parsedPrice) ? 0 : parsedPrice;
        }
        if (currency !== undefined) updates.currency = currency;
        if (sku !== undefined) updates.sku = sku;
        if (tags !== undefined) updates.tags = tags;
        if (quantity !== undefined) {
            const parsedQty = parseInt(quantity);
            updates.quantity = isNaN(parsedQty) ? 0 : parsedQty;
        }
        if (status !== undefined) updates.status = status;
        if (req.file) updates.image = `/uploads/${req.file.filename}`;

        const result = await db("products")
            .where({ id, owner_id: req.user.id })
            .update(updates)
            .returning("*");

        const updated = Array.isArray(result) ? result[0] : result;

        if (!updated) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "Product not found or no changes made",
            });
            return;
        }

        updated.image = buildImageUrl(req, updated.image);

        res.status(200).json({
            status: 200,
            success: true,
            message: "Product updated successfully",
            data: updated,
        });
    } catch (error: any) {
        console.error("Update Product Error:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to update product",
            error: error.message,
        });
    }
};

// =============================================
// DELETE PRODUCT
// =============================================
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const count = await db("products")
            .where({ id, owner_id: req.user.id, is_deleted: false })
            .update({ is_deleted: true, deleted_at: new Date(), updated_at: new Date() });

        if (!count) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "Product not found",
            });
            return;
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to delete product",
        });
    }
};
