/**
 * Validation utility functions for authentication forms
 */

export interface ValidationErrors {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate full name
 */
export const validateName = (name: string): string | null => {
    if (!name) {
        return "Name is required";
    }
    if (name.length < 2) {
        return "Name must be at least 2 characters.";
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        return "Only letters & spaces allowed.";
    }
    return null;
};

/**
 * Validate Pakistani phone number
 */
export const validatePhone = (phone: string): string | null => {
    const phoneRegex = /^(\+92|0)?[3][0-9]{9}$/;
    if (!phone) {
        return "Phone number required";
    }
    if (!phoneRegex.test(phone.replace(/[-\s]/g, ""))) {
        return "Enter valid Pakistani number.";
    }
    return null;
};

/**
 * Validate password strength
 * Requirements: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const validatePassword = (password: string): string | null => {
    if (!password) {
        return "Password required";
    }
    if (password.length < 8) {
        return "Minimum 8 characters required.";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
        return "Use uppercase, lowercase, number & special char.";
    }
    return null;
};

/**
 * Validate entire registration form
 */
export const validateRegisterForm = (formData: {
    name: string;
    email: string;
    phone: string;
    password: string;
}): ValidationErrors => {
    const errors: ValidationErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;

    if (!formData.email) {
        errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
        errors.email = "Enter a valid email address.";
    }

    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    return errors;
};

/**
 * Validate login form
 */
export const validateLoginForm = (email: string, password: string): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!email) {
        errors.email = "Email is required";
    } else if (!validateEmail(email)) {
        errors.email = "Enter a valid email address";
    }

    if (!password) {
        errors.password = "Password is required";
    }

    return errors;
};
