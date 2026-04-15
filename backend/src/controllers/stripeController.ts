import { Request, Response } from "express";
import stripe, { PLAN_PRICES } from "../config/stripe";
import db from "../db/knex";

// export const createCheckoutSession = async (req: Request, res: Response) => {
//     try {
//         const { plan, isUpgrade, currentPlan } = req.body;
//         const user = req.user;
//         console.log(`[Stripe] Creating checkout session for plan: ${plan}, user: ${user.email}, isUpgrade: ${isUpgrade}`);

//         if (!plan || !PLAN_PRICES[plan as keyof typeof PLAN_PRICES]) {
//             console.log(`[Stripe] Invalid plan: ${plan}`);
//             return res.status(400).json({ success: false, message: "Invalid plan selected" });
//         }

//         // Check if downgrade request
//         if (!isUpgrade && currentPlan) {
//             console.log(`[Stripe] Downgrade request from ${currentPlan} to ${plan}`);
            
//             // For downgrades, use Stripe's subscription update API
//             if (user.subscriptionId) {
//                 try {
//                     const newPriceId = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
//                     const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
                    
//                     // Update subscription with new plan, schedule at end of billing cycle
//                     await stripe.subscriptions.update(user.subscriptionId, {
//                         items: [
//                             {
//                                 id: subscription.items.data[0].id,
//                                 price: newPriceId,
//                             }
//                         ],
//                         billing_cycle_anchor: "unchanged", // Keep current billing date
//                         proration_behavior: "none", // No proration for downgrades
//                     });

//                     console.log(`[Stripe] Subscription downgrade: ${user.subscriptionId}, new plan: ${plan}`);
                    
//                     // Update user's pending plan in database
//                     await db("auth_users").where("id", user.id).update({
//                         subscription_plan: plan,
//                         updated_at: new Date(),
//                     });
                    
//                     return res.status(200).json({ 
//                         success: true, 
//                         message: "Plan downgrade scheduled. Changes will take effect at the end of your current billing cycle.",
//                         isDowngrade: true
//                     });
//                 } catch (error: any) {
//                     console.error("Downgrade Error:", error);
//                     return res.status(400).json({ success: false, message: "Failed to process downgrade" });
//                 }
//             }
//         }

//         // For upgrades or new subscriptions, create checkout session
//         let customerId = user.stripeCustomerId;
//         console.log(`[Stripe] Existing customerId: ${customerId}`);

//         if (!customerId) {
//             console.log(`[Stripe] Creating new Stripe customer for: ${user.email}`);
//             const customer = await stripe.customers.create({
//                 email: user.email,
//                 metadata: { userId: user.id },
//             });
//             customerId = customer.id;
//             await db("auth_users").where("id", user.id).update({
//                 stripe_customer_id: customerId,
//                 updated_at: new Date(),
//             });
//             console.log(`[Stripe] New customerId created: ${customerId}`);
//         }

//         console.log(`[Stripe] Creating checkout session...`);
        
//         const sessionConfig: any = {
//             customer: customerId,
//             payment_method_types: ["card"],
//             line_items: [
//                 {
//                     price: PLAN_PRICES[plan as keyof typeof PLAN_PRICES],
//                     quantity: 1,
//                 },
//             ],
//             mode: "subscription",
//             success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${process.env.FRONTEND_URL}/cancel`,
//             metadata: {
//                 userId: user.id,
//                 plan,
//                 isUpgrade: isUpgrade ? "true" : "false",
//             },
//             // Enable Stripe's built-in coupon/promo code field
//             allow_promotion_codes: true,
//         };

//         const session = await stripe.checkout.sessions.create(sessionConfig);

//         console.log(`[Stripe] Checkout session created: ${session.id}`);
//         res.status(200).json({ success: true, url: session.url });
//     } catch (error: any) {
//         console.error("Stripe Checkout Error:", error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// Helper function to safely convert Unix timestamp to Date
const convertUnixToDate = (unixTimestamp: any): Date | undefined => {
    if (!unixTimestamp || typeof unixTimestamp !== "number") {
        return undefined;
    }
    const date = new Date(unixTimestamp * 1000);
    // Validate the date is valid
    if (isNaN(date.getTime())) {
        return undefined;
    }
    return date;
};

// New endpoint for custom checkout - Create Payment Intent
export const createPaymentIntent = async (req: Request, res: Response) => {
    try {
        const { plan, isUpgrade, currentPlan, promoCodeId } = req.body;
        const user = req.user;
        console.log(`[Stripe] Creating payment intent for plan: ${plan}, user: ${user.email}${promoCodeId ? ', promo: ' + promoCodeId : ''}`);

        if (!plan || !PLAN_PRICES[plan as keyof typeof PLAN_PRICES]) {
            return res.status(400).json({ success: false, message: "Invalid plan selected" });
        }

        // Check if downgrade request
        if (!isUpgrade && currentPlan) {
            console.log(`[Stripe] Downgrade request from ${currentPlan} to ${plan}`);
            
            if (user.subscriptionId) {
                try {
                    const newPriceId = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
                    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
                    
                    await stripe.subscriptions.update(user.subscriptionId, {
                        items: [
                            {
                                id: subscription.items.data[0].id,
                                price: newPriceId,
                            }
                        ],
                        billing_cycle_anchor: "unchanged",
                        proration_behavior: "none",
                    });

                    await db("auth_users").where("id", user.id).update({
                        subscription_plan: plan,
                        updated_at: new Date(),
                    });
                    
                    return res.status(200).json({ 
                        success: true, 
                        message: "Plan downgrade scheduled. Changes will take effect at the end of your current billing cycle.",
                        isDowngrade: true
                    });
                } catch (error: any) {
                    console.error("Downgrade Error:", error);
                    return res.status(400).json({ success: false, message: "Failed to process downgrade" });
                }
            }
        }

        // For upgrades or new subscriptions, create payment intent
        let customerId = user.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id },
            });
            customerId = customer.id;
            await db("auth_users").where("id", user.id).update({
                stripe_customer_id: customerId,
                updated_at: new Date(),
            });
        }

        // Get plan price amount from Stripe
        const priceId = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
        const price = await stripe.prices.retrieve(priceId);
        let amount = price.unit_amount || 0; // Amount in cents

        // Apply promo code discount if provided
        if (promoCodeId) {
            try {
                const promo: any = await stripe.promotionCodes.retrieve(promoCodeId, { expand: ['coupon'] });
                if (promo && promo.coupon) {
                    const coupon = promo.coupon;
                    if (coupon.percent_off) {
                        amount = Math.round(amount * (1 - coupon.percent_off / 100));
                    } else if (coupon.amount_off) {
                        amount = Math.max(0, amount - coupon.amount_off);
                    }
                }
            } catch (promoError: any) {
                console.error(`[Stripe] Error retrieving promo code ${promoCodeId}:`, promoError.message);
            }
        }

        // Create payment intent for subscription setup
        const paymentIntent = await stripe.paymentIntents.create({
            customer: customerId,
            amount: amount,
            currency: price.currency,
            payment_method_types: ["card"],
            metadata: {
                userId: user.id,
                plan,
                isUpgrade: isUpgrade ? "true" : "false",
                type: "subscription_payment",
                promoCodeId: promoCodeId || "",
            },
            description: `${plan} Plan Subscription - ${user.email}`,
        });

        console.log(`[Stripe] Payment intent created: ${paymentIntent.id}`);
        res.status(200).json({ 
            success: true, 
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            plan,
            amount,
            currency: price.currency,
            planName: plan
        });
    } catch (error: any) {
        console.error("Payment Intent Creation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Handle payment confirmation and subscription creation
export const confirmPayment = async (req: Request, res: Response) => {
    try {
        const { paymentIntentId, plan, isUpgrade, promoCodeId } = req.body;
        const user = req.user;

        if (!paymentIntentId || !plan) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Retrieve payment intent to verify payment successful
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({ 
                success: false, 
                message: "Payment was not successful",
                status: paymentIntent.status 
            });
        }

        console.log(`[Stripe] Payment confirmed for user: ${user.email}, plan: ${plan}`);

        // Create subscription in Stripe
        const priceId = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
        const customerId = user.stripeCustomerId;
        const paymentMethodId = paymentIntent.payment_method as string;

        // Attach payment method to customer if not already attached
        try {
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });
            console.log(`[Stripe] Payment method attached to customer: ${customerId}`);
        } catch (attachError: any) {
            // Payment method might already be attached, which is fine
            if (!attachError.message.includes("already")) {
                throw attachError;
            }
            console.log(`[Stripe] Payment method already attached`);
        }

        // Set trial_end to ~30 days from now so Stripe doesn't charge the first month again
        // (the user already paid for the first month via the PaymentIntent above)
        const trialEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now

        const subscriptionParams: any = {
            customer: customerId,
            items: [{ price: priceId }],
            default_payment_method: paymentMethodId,
            trial_end: trialEnd,
            metadata: {
                userId: user.id,
                plan,
            },
        };

        if (promoCodeId) {
            subscriptionParams.discounts = [{ promotion_code: promoCodeId }];
        }

        const subscription: any = await stripe.subscriptions.create(subscriptionParams);

        console.log(`[Stripe] Subscription created: ${subscription.id}`);

        // Update user in database
        const updateFields: Record<string, any> = {
            subscription_id: subscription.id,
            subscription_plan: plan,
            subscription_status: subscription.status,
            updated_at: new Date(),
        };
        const endDate = convertUnixToDate(subscription.current_period_end);
        if (endDate) updateFields.subscription_current_period_end = endDate;
        await db("auth_users").where("id", user.id).update(updateFields);

        res.status(200).json({ 
            success: true, 
            message: "Payment successful! Subscription created.",
            subscription: {
                id: subscription.id,
                plan,
                status: subscription.status,
            }
        });
    } catch (error: any) {
        console.error("Payment Confirmation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Validate and get promotion code details
export const validatePromoCode = async (req: Request, res: Response) => {
    try {
        const { code, plan, paymentIntentId } = req.body;
        const user = req.user;

        if (!code || !plan) {
            return res.status(400).json({ success: false, message: "Code and plan are required" });
        }

        console.log(`[Stripe] Validating promo code: ${code} for plan: ${plan}`);

        // Get all promotion codes from Stripe - with promotion expansion for full details
        const promoCodes = await stripe.promotionCodes.list({
            active: true,
            limit: 100,
            expand: ['data.promotion'], // Expand promotion details
        });

        // Find matching code
        const matchedCode: any = promoCodes.data.find(
            (promoCode: any) =>
                promoCode.code.toLowerCase() === code.toLowerCase() &&
                promoCode.active === true
        );

        if (!matchedCode) {
            console.log(`[Stripe] Promo code not found: ${code}`);
            return res.status(400).json({ 
                success: false, 
                message: "Promo code is invalid or expired" 
            });
        }

        console.log(`[Stripe] Matched promo code: ${matchedCode.code}`);

        // Get coupon details from promotion field
        let coupon: any;
        let couponId: string | undefined;

        // Extract coupon from promotion field (modern Stripe API)
        const matchedCodeAny = matchedCode as any;
        console.log(`[Stripe] Promotion field type:`, typeof matchedCodeAny.promotion);
        
        if (matchedCodeAny.promotion) {
            const promotionObj = matchedCodeAny.promotion as any;
            console.log(`[Stripe] Promotion object keys:`, Object.keys(promotionObj));
            
            // Promotion object has a coupon field
            if (promotionObj.coupon) {
                if (typeof promotionObj.coupon === 'string') {
                    couponId = promotionObj.coupon;
                    console.log(`[Stripe] Coupon ID from promotion (string): ${couponId}`);
                } else if (typeof promotionObj.coupon === 'object' && promotionObj.coupon.id) {
                    couponId = promotionObj.coupon.id;
                    coupon = promotionObj.coupon;
                    console.log(`[Stripe] Coupon ID from promotion (object): ${couponId}`);
                }
            }
        }

        console.log(`[Stripe] Coupon ID extracted: ${couponId}`);

        try {
            if (!coupon && couponId) {
                // If we haven't gotten the expanded coupon object, retrieve it by ID
                console.log(`[Stripe] Retrieving coupon by ID: ${couponId}`);
                coupon = await stripe.coupons.retrieve(couponId);
            } else if (!coupon) {
                throw new Error("No coupon ID found on promotion code");
            }
        } catch (couponError: any) {
            console.error(`[Stripe] Failed to get coupon details:`, couponError.message);
            throw new Error(`Failed to get coupon details: ${couponError.message}`);
        }

        if (!coupon) {
            console.log(`[Stripe] Coupon object is null or undefined`);
            return res.status(400).json({ 
                success: false, 
                message: "Coupon not found" 
            });
        }

        // Check if coupon is valid - handle if valid field doesn't exist
        const isValid = coupon.valid !== false; // Assume valid if field doesn't exist
        if (!isValid) {
            console.log(`[Stripe] Coupon not valid:`, coupon);
            return res.status(400).json({ 
                success: false, 
                message: "This coupon is no longer valid" 
            });
        }

        console.log(`[Stripe] Promo code valid: ${code}, coupon: ${coupon.id}, percent_off: ${coupon.percent_off}, amount_off: ${coupon.amount_off}`);

        // Calculate discount amount
        const priceId = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
        const price = await stripe.prices.retrieve(priceId);
        const planAmount = price.unit_amount || 0;
        
        let discountAmount = 0;
        if (coupon.percent_off) {
            // Percentage discount
            discountAmount = Math.round((planAmount * coupon.percent_off) / 100);
        } else if (coupon.amount_off) {
            // Fixed amount discount
            discountAmount = coupon.amount_off;
        }

        const finalAmount = Math.max(0, planAmount - discountAmount);

        // Update existing PaymentIntent if ID provided
        if (paymentIntentId) {
            try {
                await stripe.paymentIntents.update(paymentIntentId, {
                    amount: finalAmount,
                    metadata: {
                        promoCodeId: matchedCode.id,
                        promoCode: code
                    }
                });
                console.log(`[Stripe] Updated PaymentIntent ${paymentIntentId} with new amount: ${finalAmount}`);
            } catch (piError: any) {
                console.error(`[Stripe] Failed to update PaymentIntent ${paymentIntentId}:`, piError.message);
            }
        }

        res.status(200).json({ 
            success: true, 
            code: matchedCode.id,
            couponId: coupon.id,
            discountPercent: coupon.percent_off || null,
            discountAmount: coupon.amount_off || null,
            discountValue: discountAmount,
            finalAmount: finalAmount,
            message: coupon.percent_off 
                ? `${coupon.percent_off}% discount applied!`
                : `Discount of ${price.currency?.toUpperCase()} ${(discountAmount / 100).toFixed(2)} applied!`
        });
    } catch (error: any) {
        console.error("Promo Code Validation Error:", error.message || error);
        const message = error.message || "Failed to validate promo code";
        res.status(500).json({ success: false, message });
    }
};



export const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"]; // Stripe webhook signature.
    let event;

    try {
        event = stripe.webhooks.constructEvent( // Verify karta hai ke request Stripe se hi aayi hai.
            req.body,
            sig as string,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (err: any) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    console.log(`[Stripe Webhook] Received event type: ${event.type}`);

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as any;
                const userId = session.metadata.userId;
                const plan = session.metadata.plan;
                const subscriptionId = session.subscription;

                console.log(`[Stripe Webhook] session.completed for userId: ${userId}, plan: ${plan}, subId: ${subscriptionId}`);

                if (!userId || !plan) {
                    throw new Error(`Missing metadata: userId=${userId}, plan=${plan}`);
                }

                const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
                console.log(`[Stripe Webhook] Subscription retrieved: ${subscription.id}, status: ${subscription.status}`);

                const pgUpdateData: Record<string, any> = {
                    subscription_id: subscriptionId,
                    subscription_plan: plan,
                    subscription_status: subscription.status,
                    updated_at: new Date(),
                };
                const endDate = convertUnixToDate(subscription.current_period_end);
                if (endDate) {
                    pgUpdateData.subscription_current_period_end = endDate;
                }
                const count = await db("auth_users").where("id", userId).update(pgUpdateData);
                if (!count) {
                    console.log(`[Stripe Webhook] User not found for ID: ${userId}`);
                } else {
                    console.log(`[Stripe Webhook] User ${userId} updated. New plan: ${plan}, status: ${subscription.status}`);
                }
                break;
            }
            case "customer.subscription.created": {
                const subscription = event.data.object as any;
                const customerId = subscription.customer;
                const subscriptionId = subscription.id;

                console.log(`[Stripe Webhook] subscription.created for customer: ${customerId}, subId: ${subscriptionId}`);

                const user = await db("auth_users").where("stripe_customer_id", customerId).first();
                if (user) {
                    // Get plan from subscription items
                    const priceId = subscription.items.data[0]?.price.id;
                    let planName: "Basic" | "Pro" | "Enterprise" | "Free" = "Free";
                    
                    // Find which plan this price belongs to
                    for (const [plan, id] of Object.entries(PLAN_PRICES)) {
                        if (id === priceId) {
                            planName = plan as "Basic" | "Pro" | "Enterprise" | "Free";
                            break;
                        }
                    }

                    const subUpdate: Record<string, any> = {
                        subscription_id: subscriptionId,
                        subscription_plan: planName,
                        subscription_status: subscription.status,
                        updated_at: new Date(),
                    };
                    const endDate = convertUnixToDate(subscription.current_period_end);
                    if (endDate) subUpdate.subscription_current_period_end = endDate;
                    await db("auth_users").where("id", user.id).update(subUpdate);
                    console.log(`[Stripe Webhook] User ${user.email} subscription created. Plan: ${planName}, status: ${subscription.status}`);
                } else {
                    console.log(`[Stripe Webhook] User not found for customerId: ${customerId}`);
                }
                break;
            }
            case "customer.subscription.updated": {
                const subscription = event.data.object as any;
                const customerId = subscription.customer;

                console.log(`[Stripe Webhook] subscription.updated for customer: ${customerId}`);

                const user = await db("auth_users").where("stripe_customer_id", customerId).first();
                if (user) {
                    const updFields: Record<string, any> = {
                        subscription_status: subscription.status,
                        updated_at: new Date(),
                    };
                    const endDate = convertUnixToDate(subscription.current_period_end);
                    if (endDate) updFields.subscription_current_period_end = endDate;
                    await db("auth_users").where("id", user.id).update(updFields);
                    console.log(`[Stripe Webhook] User ${user.email} subscription updated to status: ${subscription.status}`);
                } else {
                    console.log(`[Stripe Webhook] User not found for customerId: ${customerId}`);
                }
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object as any;
                const customerId = subscription.customer;

                console.log(`[Stripe Webhook] subscription.deleted for customer: ${customerId}`);

                const user = await db("auth_users").where("stripe_customer_id", customerId).first();
                if (user) {
                    await db("auth_users").where("id", user.id).update({
                        subscription_plan: "Free",
                        subscription_status: "canceled",
                        subscription_id: null,
                        updated_at: new Date(),
                    });
                    console.log(`[Stripe Webhook] User ${user.email} subscription deleted. Reset to Free plan`);
                } else {
                    console.log(`[Stripe Webhook] User not found for customerId: ${customerId}`);
                }
                break;
            }
            case "customer.created":
                console.log("[Stripe Webhook] Customer created in Stripe");
                break;
            default:
                console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
        }
        res.json({ received: true });
    } catch (err: any) {
        console.error("[Stripe Webhook Error] Internal Failure:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
    try {
        const user = await db("auth_users").where("id", req.user.id).first();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            subscription: {
                plan: user.subscriptionPlan,
                status: user.subscriptionStatus,
                currentPeriodEnd: user.subscriptionCurrentPeriodEnd,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};