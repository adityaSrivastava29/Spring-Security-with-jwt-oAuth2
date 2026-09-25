package in.adityasri.spring_security_backend.controllers;

import in.adityasri.spring_security_backend.advices.ApiResponse;
import in.adityasri.spring_security_backend.dto.UpdateProfileDto;
import in.adityasri.spring_security_backend.dto.UserDto;
import in.adityasri.spring_security_backend.entities.AccountType;
import in.adityasri.spring_security_backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(Principal principal) {
        UserDto profile = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("User profile retrieved successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateProfileDto updateProfileDto
    ) {
        UserDto updated = userService.updateProfile(principal.getName(), updateProfileDto);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @GetMapping("/user-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserData(Principal principal) {
        UserDto user = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Standard user protected resource accessed", Map.of(
                "title", "Standard Member Portal",
                "message", "Welcome back, " + user.getName() + "! Your authenticated session is active and secure.",
                "accountType", user.getAccountType(),
                "roles", user.getRoles(),
                "provider", user.getProvider()
        )));
    }

    @GetMapping("/b2b-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getB2BData(Principal principal) {
        UserDto user = userService.getUserProfile(principal.getName());
        boolean isB2B = user.getAccountType() == AccountType.B2B || user.getRoles().contains("ROLE_ADMIN");

        if (!isB2B) {
            return ResponseEntity.status(403).body(
                    ApiResponse.ok("Access restricted: This resource is designated for B2B enterprise client accounts.", Map.of(
                            "authorized", false,
                            "requiredTier", "B2B_ENTERPRISE",
                            "currentTier", user.getAccountType()
                    ))
            );
        }

        return ResponseEntity.ok(ApiResponse.ok("Enterprise B2B client workspace data retrieved", Map.of(
                "company", user.getOrganization() != null ? user.getOrganization() : "Enterprise Partner",
                "planTier", "Enterprise Dedicated SLA (99.99%)",
                "apiQuotaUsage", "42,850 / 500,000 monthly calls",
                "contractRenewal", "2027-12-31",
                "multiTenantKey", "org_live_b2b_8849201947"
        )));
    }

    @GetMapping("/b2c-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getB2CData(Principal principal) {
        UserDto user = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Consumer B2C profile rewards and activity retrieved", Map.of(
                "consumerName", user.getName(),
                "loyaltyTier", "Gold Rewards Club",
                "rewardPoints", 1450,
                "pendingOrders", 2,
                "discountCode", "WELCOME15"
        )));
    }

    @GetMapping("/moderator-data")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getModeratorData(Principal principal) {
        return ResponseEntity.ok(ApiResponse.ok("Moderator protected resource accessed", Map.of(
                "title", "Community & Account Audit Queue",
                "message", "Welcome Moderator " + principal.getName() + ". You have moderation privileges over community content.",
                "pendingReviews", 5,
                "flaggedAccounts", 1,
                "auditStatus", "All queues within operational SLA"
        )));
    }

    @GetMapping("/audit-vault")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAuditVault(Principal principal) {
        return ResponseEntity.ok(ApiResponse.ok("Enterprise Security & Audit Vault accessed", Map.of(
                "vaultStatus", "OPERATIONAL - ENCRYPTED",
                "encryptionStandard", "AES-256-GCM / HSM-Backed",
                "lastAuditTimestamp", java.time.LocalDateTime.now().toString(),
                "accessRecords", java.util.List.of(
                        Map.of("id", "AUD-901", "event", "ADMIN_KEY_ROTATION", "severity", "LOW", "ip", "10.0.4.12", "timestamp", "2026-09-25 14:20:00"),
                        Map.of("id", "AUD-902", "event", "ROLE_ELEVATION_ATTEMPT", "severity", "HIGH", "ip", "192.168.1.105", "timestamp", "2026-09-25 14:35:12"),
                        Map.of("id", "AUD-903", "event", "B2B_TENANT_PROVISION", "severity", "INFO", "ip", "10.0.12.88", "timestamp", "2026-09-25 14:52:41")
                ),
                "activeAuditor", principal.getName()
        )));
    }
}
