import { Router } from "express";
import {  handleWebhook, getSubscriptionStatus, createPaymentIntent, confirmPayment, validatePromoCode } from "../controllers/stripeController";
import { authenticate } from "../middleware/auth";
import express from "express";

const router = Router();

// router.post("/create-checkout-session", authenticate, createCheckoutSession);
router.post("/create-payment-intent", authenticate, createPaymentIntent);
router.post("/confirm-payment", authenticate, confirmPayment);
router.post("/validate-promo-code", authenticate, validatePromoCode);
router.get("/status", authenticate, getSubscriptionStatus);

// Webhook needs raw body, handled in index.ts for specific path
export const webhookRouter = Router();
webhookRouter.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

export default router;
