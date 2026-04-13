import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default stripe;

export const PLAN_PRICES = {
    Basic: "price_1T9K9X0V8mbjbBNyFDzXZU28",
    Pro: "price_1T9KCk0V8mbjbBNybM6tPgfR",
    Enterprise: "price_1T9KDj0V8mbjbBNyGWE9484x",
};
