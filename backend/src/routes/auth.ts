import { Router } from "express";
import {
    register,
    login,
    checkLoginStatus,
    verifyEmail,
    forgotPassword,
    resetPassword,
    validateResetToken,
    logout,
    updateProfile,
    changePassword,
    verifyInvite,
    registerInvited,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import upload from "../middleware/upload";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// CHECK LOGIN STATUS (COOKIE BASED)
router.get("/me", authenticate, checkLoginStatus);

// EMAIL VERIFICATION ROUTE
router.get("/verify/:token", verifyEmail);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Validate Reset Token
router.get("/reset-password/:token", validateResetToken);

// Reset Password
router.post("/reset-password/:token", resetPassword);

// UPDATE PROFILE
router.put("/profile", authenticate, upload.single("profileImage"), updateProfile);

// CHANGE PASSWORD
router.post("/change-password", authenticate, changePassword);

// INVITATION ROUTES
router.get("/verify-invite/:token", verifyInvite);
router.post("/register-invited", registerInvited);

// LOGOUT ROUTE
router.post("/logout", logout);

export default router;
