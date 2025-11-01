Objective: Refactor the existing AuthModule (primarily auth.service.ts and email.service.ts) to fix two specific issues:

Missing Feature: Implement a "Welcome Email" that is sent to the admin user upon successful subscriber registration.

Performance Bottleneck: Re-architect the "Reset Password" flow to be highly performant. The current method of hashing the reset token, saving it, and then fetching all users to loop and compare with bcrypt is too slow. We will switch to storing a secure plaintext token for a short duration, allowing for a direct, indexed database lookup.

You will modify the existing files based on the provided context.

Task 1: Implement "Welcome Email on Registration"
1.1. Modify modules/auth/email/email.service.ts

Add a new public method: async sendWelcomeEmail(email: string, adminName: string): Promise<void>.

This method should be similar to sendPasswordResetEmail but use a different subject and HTML template.

Subject: "Welcome to the KYC Platform, [Admin Name]!"

HTML Template: Create a new private method getWelcomeTemplate(adminName: string) that returns HTML for a welcome email. It should greet the user and provide a link to the login page (from FRONTEND_URL).

Example: "Hello [Admin Name], Your company has been successfully registered on the KYC Platform. You can now log in as the administrator..."

1.2. Modify modules/auth/auth.service.ts

Inside the registerSubscriber method:

After the line const savedAdminUser = await this.subscriberUserRepository.save(adminUser); and before the return statement:

Add a call to the new email service method.

Crucially: Wrap this call in a try...catch block. A failed email should not cause the registration to fail. It should only be logged.

TypeScript

// ... after saving savedAdminUser

try {
  await this.emailService.sendWelcomeEmail(savedAdminUser.email, firstName);
  this.logger.log(`Welcome email sent to admin: ${savedAdminUser.email}`);
} catch (emailError) {
  this.logger.error(`Failed to send welcome email to ${savedAdminUser.email}`, emailError);
  // Do not re-throw; registration should still succeed
}

this.logger.log(`New subscriber registered: ${savedSubscriber.id} with admin user: ${savedAdminUser.id}`);

return {
  subscriberId: savedSubscriber.id,
  adminUserId: savedAdminUser.id,
};
Task 2: Fix "Reset Password" Performance Bottleneck
This task involves changing the strategy from "hash and compare all" to "store plaintext token and find one."

2.1. Modify modules/auth/auth.service.ts -> forgotPassword method

Find the line where the resetToken is generated and hashed.

Change this:

TypeScript

// OLD (DO NOT USE):
// const resetToken = crypto.randomBytes(32).toString('hex');
// const hashedResetToken = await bcrypt.hash(resetToken, 12);
// ...
// await this.subscriberUserRepository.update(user.id, {
//   reset_token: hashedResetToken,
//   ...
// });
To this (New Logic):

TypeScript

// NEW LOGIC:
const resetToken = crypto.randomBytes(32).toString('hex'); // Generate secure token
const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

// Store the PLAINTEXT token directly. This is secure enough for a 
// short-lived, single-use, unguessable token and allows for a fast lookup.
await this.subscriberUserRepository.update(user.id, {
  reset_token: resetToken, // Save the plaintext token
  reset_token_expires: resetTokenExpires,
});

// Send the plaintext token in the email (this is already correct)
await this.emailService.sendPasswordResetEmail(user.email, resetToken);
2.2. Modify modules/auth/auth.service.ts -> resetPassword method

This method needs to be completely rewritten to be efficient.

Remove this:

TypeScript

// OLD (DO NOT USE):
// const usersWithResetTokens = await this.subscriberUserRepository.findUsersWithActiveResetTokens();
// let user: any = null;
// for (const candidate of usersWithResetTokens) {
//   if (candidate.reset_token && await bcrypt.compare(dto.token, candidate.reset_token)) {
//     user = candidate;
//     break;
//   }
// }
Replace it with this (New Logic):

TypeScript

// NEW LOGIC:

// 1. Find the user DIRECTLY using the plaintext token.
// This repository method already exists and checks for expiry.
const user = await this.subscriberUserRepository.findByResetToken(dto.token);

// 2. Check if user was found.
if (!user) {
  throw new BadRequestException('Invalid or expired reset token');
}

// 3. Hash the NEW password
const hashedPassword = await bcrypt.hash(dto.new_password, 12);

// 4. Update the password and clear all tokens (this is correct)
await this.subscriberUserRepository.updatePassword(user.id, hashedPassword);
await this.subscriberUserRepository.update(user.id, {
  reset_token: null,
  reset_token_expires: null,
  hashed_refresh_token: null, // Invalidate all sessions
});

this.logger.log(`Password reset successfully for user ${user.id}`);

return {
  message: 'Password reset successfully',
};
2.3. Verify modules/subscriber-users/repositories/subscriber-user.repository.ts

No change is needed, but confirm that the findByResetToken method exists and is implemented as follows (which it is, according to context):

TypeScript

async findByResetToken(token: string): Promise<SubscriberUserEntity | null> {
  return this.subscriberUserRepository.findOne({
    where: { 
      reset_token: token, // This is a direct string comparison
      reset_token_expires: { $gt: new Date() } as any, // Checks expiry
      is_active: true,
      deleted_at: IsNull()
    }
  });
}
By implementing these two changes, the AuthModule will be complete and performant.