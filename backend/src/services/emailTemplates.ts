export const getVerificationEmailTemplate = (verifyLink: string): string => {
    return `
    <h2>Email Verification</h2>
    <p>Click the button below to verify your account:</p>
    <a href="${verifyLink}" 
       style="padding:10px 15px;background:#4CAF50;color:#fff;text-decoration:none;">
       Verify Email
    </a>
  `;
};

export const getResetPasswordTemplate = (link: string): string => {
    return `
  <h2>Password Reset</h2>
  <p>Click below to reset your password:</p>
  <a href="${link}">Reset Password</a>
  <p>This link expires in 1 hour.</p>
`;
};

export const getInvitationEmailTemplate = (inviteLink: string): string => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #7c3aed; text-align: center;">You're Invited!</h2>
        <p>Hello,</p>
        <p>You have been invited to join our team. Click the button below to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="padding: 12px 24px; background-color: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
               Complete Registration
            </a>
        </div>
        <p style="color: #666; font-size: 14px;">This invitation link will expire in 24 hours and can only be used once.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
  `;
};
