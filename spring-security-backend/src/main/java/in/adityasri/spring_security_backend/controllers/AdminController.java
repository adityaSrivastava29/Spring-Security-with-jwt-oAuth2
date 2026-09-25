package in.adityasri.spring_security_backend.controllers;

import in.adityasri.spring_security_backend.advices.ApiResponse;
import in.adityasri.spring_security_backend.dto.UpdateRoleRequestDto;
import in.adityasri.spring_security_backend.dto.UserDto;
import in.adityasri.spring_security_backend.entities.AccountType;
import in.adityasri.spring_security_backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboard() {
        List<UserDto> users = userService.getAllUsers();
        long adminCount = users.stream().filter(u -> u.getRoles().contains("ROLE_ADMIN")).count();
        long modCount = users.stream().filter(u -> u.getRoles().contains("ROLE_MODERATOR")).count();
        long userCount = users.stream().filter(u -> u.getRoles().contains("ROLE_USER")).count();
        long b2bCount = users.stream().filter(u -> u.getAccountType() == AccountType.B2B).count();
        long b2cCount = users.stream().filter(u -> u.getAccountType() == AccountType.B2C).count();

        Map<String, Object> stats = Map.of(
                "totalUsers", users.size(),
                "adminUsers", adminCount,
                "moderatorUsers", modCount,
                "standardUsers", userCount,
                "b2bUsers", b2bCount,
                "b2cUsers", b2cCount,
                "systemStatus", "OPERATIONAL",
                "securityEngine", "Spring Security 6 (Stateless JWT + OAuth2)"
        );

        return ResponseEntity.ok(ApiResponse.ok("Admin dashboard metrics retrieved successfully", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok("Users list retrieved successfully", users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("User retrieved successfully", user));
    }

    @PutMapping("/users/{id}/roles")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequestDto updateRoleRequestDto
    ) {
        UserDto updatedUser = userService.updateUserRoles(id, updateRoleRequestDto.getRoles());
        return ResponseEntity.ok(ApiResponse.ok("User roles updated successfully", updatedUser));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(@PathVariable Long id) {
        UserDto updatedUser = userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("User status updated successfully", updatedUser));
    }

    @PatchMapping("/users/{id}/account-type")
    public ResponseEntity<ApiResponse<UserDto>> updateAccountType(
            @PathVariable Long id,
            @RequestParam AccountType accountType
    ) {
        UserDto updatedUser = userService.updateUserAccountType(id, accountType);
        return ResponseEntity.ok(ApiResponse.ok("Account type updated successfully", updatedUser));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully"));
    }

    @GetMapping("/rbac-matrix")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRbacMatrix() {
        List<Map<String, Object>> matrix = List.of(
                Map.of(
                        "resource", "Public Authentication",
                        "endpoint", "/api/v1/auth/**",
                        "guest", true,
                        "b2cUser", true,
                        "b2bUser", true,
                        "moderator", true,
                        "admin", true,
                        "description", "Signup, Login, Token Refresh, Social Google OAuth2"
                ),
                Map.of(
                        "resource", "Personal Profile & Self-Update",
                        "endpoint", "/api/v1/users/profile",
                        "guest", false,
                        "b2cUser", true,
                        "b2bUser", true,
                        "moderator", true,
                        "admin", true,
                        "description", "View and update self display name and organization details"
                ),
                Map.of(
                        "resource", "B2C Consumer Space",
                        "endpoint", "/api/v1/users/b2c-data",
                        "guest", false,
                        "b2cUser", true,
                        "b2bUser", true,
                        "moderator", true,
                        "admin", true,
                        "description", "Consumer loyalty points, personal orders, promotional coupons"
                ),
                Map.of(
                        "resource", "B2B Enterprise Portal",
                        "endpoint", "/api/v1/users/b2b-data",
                        "guest", false,
                        "b2cUser", false,
                        "b2bUser", true,
                        "moderator", false,
                        "admin", true,
                        "description", "Enterprise SLA, dedicated API quotas, corporate contract metadata"
                ),
                Map.of(
                        "resource", "Moderator Queue",
                        "endpoint", "/api/v1/users/moderator-data",
                        "guest", false,
                        "b2cUser", false,
                        "b2bUser", false,
                        "moderator", true,
                        "admin", true,
                        "description", "Audit logs, community flagged queues, moderation analytics"
                ),
                Map.of(
                        "resource", "Admin Control Panel & Users Registry",
                        "endpoint", "/api/v1/admin/**",
                        "guest", false,
                        "b2cUser", false,
                        "b2bUser", false,
                        "moderator", false,
                        "admin", true,
                        "description", "Full user registry, RBAC role assignment, account status toggle, deletion"
                ),
                Map.of(
                        "resource", "Enterprise Security & Audit Vault",
                        "endpoint", "/api/v1/users/audit-vault",
                        "guest", false,
                        "b2cUser", false,
                        "b2bUser", false,
                        "moderator", false,
                        "admin", true,
                        "description", "Cryptographic HSM seals, key rotation events, security telemetry (Visible in nav to users, enforced by @PreAuthorize)"
                )
        );

        return ResponseEntity.ok(ApiResponse.ok("Granular RBAC permission matrix retrieved successfully", matrix));
    }
}
