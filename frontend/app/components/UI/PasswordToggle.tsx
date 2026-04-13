import React from "react";

interface PasswordToggleProps {
    showPassword: boolean;
    onClick: () => void;
}

const PasswordToggle: React.FC<PasswordToggleProps> = ({ showPassword, onClick }) => {
    return (
        <button
            type="button"
            className="password-toggle"
            onClick={onClick}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
        >
            {showPassword ? (
                // Eye icon (show)
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            ) : (
                // Eye-off icon (hide)
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-7 1.05-2.1 2.6-3.9 4.46-5.16"></path>
                    <path d="M1 1l22 22"></path>
                </svg>
            )}
        </button>
    );
};

export default PasswordToggle;
