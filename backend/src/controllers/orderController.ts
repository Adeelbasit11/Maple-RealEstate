import { Request, Response } from "express";
import knex from "../db/knex";

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await knex("orders")
            .join("auth_users", "orders.customer_id", "auth_users.id")
            .join("products", "orders.product_id", "products.id")
            .select(
                "orders.*",
                "auth_users.name as customer_name",
                "auth_users.email as customer_email",
                "auth_users.profile_image as customer_avatar",
                "products.name as product_name",
                "products.image as product_image"
            );
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await knex("orders")
            .where("orders.id", id)
            .join("auth_users", "orders.customer_id", "auth_users.id")
            .join("products", "orders.product_id", "products.id")
            .select(
                "orders.*",
                "auth_users.name as customer_name",
                "auth_users.email as customer_email",
                "auth_users.profile_image as customer_avatar",
                "products.name as product_name",
                "products.image as product_image"
            )
            .first();

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};