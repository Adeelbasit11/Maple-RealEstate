export interface IUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    username?: string;
    city?: string;
    country?: string;
    zipCode?: string;
    bio?: string;
    timezone?: string;
    profileImage?: string;
    role: "SuperAdmin" | "Admin" | "Editor" | "Viewer";
    isVerified: boolean;
    ownerId?: string;
    stripeCustomerId?: string;
    subscriptionId?: string;
    subscriptionPlan?: "Basic" | "Pro" | "Enterprise" | "Free";
    subscriptionStatus?: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid";
    subscriptionCurrentPeriodEnd?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ITeamMember {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    username?: string;
    city?: string;
    country?: string;
    zipCode?: string;
    bio?: string;
    timezone?: string;
    profileImage?: string;
    role: "SuperAdmin" | "Admin" | "Editor" | "Viewer";
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IToast {
    message: string;
    type: "success" | "error" | "info" | "warning";
}

export interface IAuthContext {
    tokenStatus: boolean;
    user: IUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (userData: any) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
    verifyResetToken: (token: string) => Promise<{ success: boolean; message: string }>;
    resetPassword: (token: string, password: string) => Promise<{ success: boolean; message: string }>;
    updateProfile: (profileData: any) => Promise<{ success: boolean; message: string }>;
    updateUserContext: (newData: Partial<IUser>) => void;
    refreshUser: () => Promise<void>;
}

export interface IToastContext {
    toast: IToast | null;
    showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
    success: (message: string) => void;
    error: (message: string) => void;
    hideToast: () => void;
}

export interface IUsersContext {
    users: IUser[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    searchUsers: (query: string) => Promise<{ success: boolean; data?: any[] }>;
    createUser: (userData: any) => Promise<any>;
    updateUser: (id: string, userData: any) => Promise<any>;
    deleteUser: (id: string) => Promise<any>;
    inviteUser: (email: string, role?: string) => Promise<any>;
}

export interface ITeamContext {
    teamMembers: ITeamMember[];
    loading: boolean;
    error: string | null;
    fetchTeamMembers: () => Promise<void>;
    searchTeamMembers: (query: string) => Promise<{ success: boolean; data?: any[] }>;
    createTeamMember: (memberData: any) => Promise<any>;
    updateTeamMember: (id: string, memberData: any) => Promise<any>;
    deleteTeamMember: (id: string) => Promise<any>;
}
