package in.adityasri.spring_security_backend.dto;

import in.adityasri.spring_security_backend.entities.AuthProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private Set<String> roles;
    private AuthProvider provider;
    private in.adityasri.spring_security_backend.entities.AccountType accountType;
    private boolean enabled;
    private String organization;
    private String avatarUrl;
    private LocalDateTime createdAt;
}
