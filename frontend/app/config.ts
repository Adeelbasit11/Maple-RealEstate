const CONFIG = {
    API_BASE_URL: "/api",
    AUTH_URL: "/api/auth",
    AUTH_ENDPOINTS: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        CHECK_LOGIN: "/api/auth/me",
        LOGOUT: "/api/auth/logout",
        UPDATE_PROFILE: "/api/auth/profile",
        VERIFY_INVITE: "/api/auth/verify-invite",
        REGISTER_INVITED: "/api/auth/register-invited",
        FORGOT_PASSWORD: "/api/auth/forgot-password",
        RESET_PASSWORD: "/api/auth/reset-password",
    },
    USERS_ENDPOINTS: {
        BASE: "/api/users",
        INVITE: "/api/users/invite",
    },
    TEAM_ENDPOINTS: {
        BASE: "/api/team",
    },
    STRIPE_ENDPOINTS: {
        BASE: "/api/stripe",
        CHECKOUT_SESSION: "/api/stripe/create-checkout-session",
        PAYMENT_INTENT: "/api/stripe/create-payment-intent",
        CONFIRM_PAYMENT: "/api/stripe/confirm-payment",
        VALIDATE_PROMO_CODE: "/api/stripe/validate-promo-code",
        STATUS: "/api/stripe/status",
        VALIDATE_DISCOUNT: "/api/stripe/validate-discount",
    },
};

export default CONFIG;
