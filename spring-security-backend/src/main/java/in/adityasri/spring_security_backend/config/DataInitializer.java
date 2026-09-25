package in.adityasri.spring_security_backend.config;

import in.adityasri.spring_security_backend.entities.AccountType;
import in.adityasri.spring_security_backend.entities.AuthProvider;
import in.adityasri.spring_security_backend.entities.Role;
import in.adityasri.spring_security_backend.entities.UserEntity;
import in.adityasri.spring_security_backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@example.com")) {
            UserEntity admin = UserEntity.builder()
                    .name("System Admin")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("admin123"))
                    .provider(AuthProvider.LOCAL)
                    .accountType(AccountType.B2B)
                    .organization("Global Enterprise Corp")
                    .roles(Set.of(Role.ROLE_ADMIN, Role.ROLE_MODERATOR, Role.ROLE_USER))
                    .build();
            userRepository.save(admin);
            log.info("Initialized default admin user: admin@example.com / admin123");
        }

        if (!userRepository.existsByEmail("enterprise@acme.com")) {
            UserEntity b2bUser = UserEntity.builder()
                    .name("Marcus Vance (B2B Lead)")
                    .email("enterprise@acme.com")
                    .password(passwordEncoder.encode("b2b123"))
                    .provider(AuthProvider.LOCAL)
                    .accountType(AccountType.B2B)
                    .organization("Acme Industrial Technologies")
                    .roles(Set.of(Role.ROLE_USER))
                    .build();
            userRepository.save(b2bUser);
            log.info("Initialized default B2B user: enterprise@acme.com / b2b123");
        }

        if (!userRepository.existsByEmail("user@example.com")) {
            UserEntity user = UserEntity.builder()
                    .name("Jane Doe")
                    .email("user@example.com")
                    .password(passwordEncoder.encode("user123"))
                    .provider(AuthProvider.LOCAL)
                    .accountType(AccountType.B2C)
                    .roles(Set.of(Role.ROLE_USER))
                    .build();
            userRepository.save(user);
            log.info("Initialized default B2C user: user@example.com / user123");
        }

        if (!userRepository.existsByEmail("mod@example.com")) {
            UserEntity mod = UserEntity.builder()
                    .name("Morgan Riley (Moderator)")
                    .email("mod@example.com")
                    .password(passwordEncoder.encode("mod123"))
                    .provider(AuthProvider.LOCAL)
                    .accountType(AccountType.B2C)
                    .roles(Set.of(Role.ROLE_MODERATOR, Role.ROLE_USER))
                    .build();
            userRepository.save(mod);
            log.info("Initialized default Moderator user: mod@example.com / mod123");
        }
    }
}
