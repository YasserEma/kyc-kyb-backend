Implement User Management (Phase 2)
Objective: Implement a comprehensive User Management API (CRUD) within the existing NestJS application. This API will be used by authenticated admin users to manage other users within their own subscriber account.

This involves expanding the SubscriberUsersModule to include a new SubscriberUsersController and SubscriberUsersService, secured by the AuthModule.

Core Requirements & Best Practices:

Architecture: Strictly follow the "Thick Service, Thin Controller" pattern.

SubscriberUsersController (Thin): Handles request/response mapping, DTO validation, Swagger documentation, and extracting user/subscriber info from the request.

SubscriberUsersService (Thick): Contains all business logic, including database queries, role checks, password hashing, and sending emails.

Security & Scoping (Critical):

All endpoints in SubscriberUsersController must be protected by the existing JwtAuthGuard.

The TokenPayload (available as req.user) is the source of truth. All service methods must accept the authenticated user's ID (req.user.sub) and their Subscriber ID (req.user.subscriberId).

All database queries (find, update, delete) MUST be scoped to the authenticated user's subscriberId. An admin from Company A must never be able to see, edit, or delete users from Company B.

Role-Based Access Control (RBAC):

Create a new RolesGuard (src/modules/auth/guards/roles.guard.ts) that checks the role field from the TokenPayload.

Create a new @Roles decorator (src/modules/auth/decorators/roles.decorator.ts).

Apply @UseGuards(JwtAuthGuard, RolesGuard) and @Roles('admin') to all admin-only endpoints as specified in the API documentation (create_user, update_user, delete_user, etc.).

Data Validation (DTOs):

Create all necessary DTOs for request bodies and query parameters in src/modules/subscriber-users/dto/.

Use class-validator and @nestjs/swagger (@ApiProperty) decorators extensively.

Name Fields: The API spec uses name, but the entity SubscriberUserEntity uses first_name and last_name. The DTOs (CreateUserDto, UpdateUserDto) must accept first_name and last_name. The response DTOs should use the full_name virtual property from the entity.

Email Integration:

Expand the existing EmailService with two new methods:

sendNewUserInvitation(email: string, fullName: string, temporaryPassword: string)

sendAdminPasswordChange(email: string, fullName: string, newPassword: string)

These methods should send emails with the new credentials.

Swagger Documentation:

Implement complete @nestjs/swagger documentation for all new endpoints, DTOs, and response types as specified in the API. Use @ApiTags('User Management'), @ApiOperation, @ApiBearerAuth, @ApiBody, @ApiParam, @ApiQuery, and @ApiResponse for all success and error codes.

Module Expansion:

Update SubscriberUsersModule to import AuthModule (for guards and EmailService) and LogsModule (for LogRepository).

Add the new SubscriberUsersController and SubscriberUsersService to the controllers and providers arrays.

The AuthModule may need to be forwardRef if there is a circular dependency.

API Endpoint Implementation Details:
File: src/modules/subscriber-users/subscriber-users.controller.ts
Apply @ApiTags('User Management'), @ApiBearerAuth(), and @UseGuards(JwtAuthGuard) at the class level.

File: src/modules/subscriber-users/subscriber-users.service.ts
Inject SubscriberUserRepository, EmailService, LogRepository, ScreeningAnalysisRepository, RiskAnalysisRepository, and ConfigService.

1. GET /api/v1/users (List Subscriber Users)

Controller:

@UseGuards(RolesGuard) and @Roles('admin').

Accept pagination/filter DTO (ListUsersQueryDto) from @Query().

Extract subscriberId from req.user.

Call service.listUsers(subscriberId, query).

Service (listUsers):

Use subscriberUserRepository.findWithFilters.

Crucially, merge the query filters with subscriber_id: subscriberId to ensure scoping.

Format the response to match the API spec (include pagination object).

2. GET /api/v1/users/{user_id} (Get User Details)

Controller:

@UseGuards(RolesGuard) and @Roles('admin', 'analyst', 'reviewer', 'auditor'). (Allow non-admins to view others in their team).

Extract subscriberId from req.user.

Call service.getUserDetails(userId, subscriberId).

Service (getUserDetails):

Find the user: subscriberUserRepository.findOne({ where: { id: userId, subscriber_id: subscriberId } }). Throw NotFoundException if null.

To build activity_summary, inject LogRepository, ScreeningAnalysisRepository, RiskAnalysisRepository.

Run parallel count() queries:

logRepository.count({ where: { user_id: userId, action_type: 'ENTITY_CREATE' } })

screeningAnalysisRepository.count({ where: { created_by: userId } })

riskAnalysisRepository.count({ where: { created_by: userId } })

logRepository.count({ where: { user_id: userId, action_type: 'REVIEW_COMPLETE' } })

Combine results and return.

3. POST /api/v1/users (Create User)

Controller:

@UseGuards(RolesGuard) and @Roles('admin').

Accept CreateUserDto from @Body().

Extract subscriberId and adminName (from req.user) for logging/created_by.

Call service.createUser(dto, subscriberId, req.user.sub).

Service (createUser):

Check for existing email within the subscriber account: subscriberUserRepository.findOne({ where: { email: dto.email, subscriber_id: subscriberId } }). Throw ConflictException if found.

Generate a temporary password (e.g., crypto.randomBytes(8).toString('hex')).

Hash the temporary password using bcrypt.

Create the new SubscriberUserEntity, setting password_hash, role, permissions, and subscriber_id.

Save the user.

If dto.send_invitation_email is true, call emailService.sendNewUserInvitation(dto.email, dto.first_name, temporaryPassword) in a try...catch block (email failure should not fail the request).

Return the new user data.

4. PUT /api/v1/users/{user_id} (Update User)

Controller:

@UseGuards(RolesGuard) and @Roles('admin').

Accept UpdateUserDto from @Body().

Call service.updateUser(userId, dto, req.user.subscriberId).

Service (updateUser):

Find the user to update: subscriberUserRepository.findOne({ where: { id: userId, subscriber_id: subscriberId } }). Throw NotFoundException if null.

If dto.email is provided and different from user.email, check for email conflict within the subscriber account. Throw ConflictException if found.

Update the user entity with fields from the DTO.

Save and return the updated user.

5. PATCH /api/v1/users/{user_id}/password (Change User Password)

Controller:

@UseGuards(JwtAuthGuard) (No RolesGuard needed here, logic is in service).

Accept ChangePasswordDto from @Body().

Call service.changeUserPassword(userId, dto, req.user).

Service (changeUserPassword):

const authenticatedUser = req.user as TokenPayload;

Find the user to update: subscriberUserRepository.findOne({ where: { id: userId, subscriber_id: authenticatedUser.subscriberId } }). Throw NotFoundException if null.

Logic:

If authenticatedUser.sub === userId (changing own password):

Check dto.current_password. Throw BadRequestException if missing.

Verify dto.current_password against user.password_hash with bcrypt.compare. Throw UnauthorizedException if no match.

Else if authenticatedUser.role === 'admin' (admin changes another user's password):

Proceed. No current_password check needed.

Else:

Throw ForbiddenException (not admin, not self).

Hash dto.new_password using bcrypt.

Update the user with password_hash and hashed_refresh_token: null (to log out other sessions).

If admin and send_invitation_email (add this to DTO) is true, call emailService.sendAdminPasswordChange(user.email, user.full_name, dto.new_password).