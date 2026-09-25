package in.adityasri.spring_security_backend.dto;

import in.adityasri.spring_security_backend.entities.Role;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleRequestDto {
    @NotEmpty(message = "Roles cannot be empty")
    private Set<Role> roles;
}
