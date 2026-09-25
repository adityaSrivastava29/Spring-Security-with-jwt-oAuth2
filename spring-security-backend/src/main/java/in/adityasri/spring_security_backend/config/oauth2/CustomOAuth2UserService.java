package in.adityasri.spring_security_backend.config.oauth2;

import in.adityasri.spring_security_backend.entities.AuthProvider;
import in.adityasri.spring_security_backend.entities.Role;
import in.adityasri.spring_security_backend.entities.UserEntity;
import in.adityasri.spring_security_backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        processOAuth2User(oAuth2User);
        return oAuth2User;
    }

    private void processOAuth2User(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        if (email == null || email.isBlank()) {
            log.warn("OAuth2 provider did not return an email");
            return;
        }

        email = email.toLowerCase().trim();
        Optional<UserEntity> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            Set<Role> roles = new HashSet<>();
            roles.add(Role.ROLE_USER);

            UserEntity newUser = UserEntity.builder()
                    .email(email)
                    .name(name != null ? name : "Google User")
                    .avatarUrl(picture)
                    .provider(AuthProvider.GOOGLE)
                    .roles(roles)
                    .build();

            userRepository.save(newUser);
            log.info("Auto-provisioned new Google user: {}", email);
        } else {
            UserEntity existingUser = userOptional.get();
            if (picture != null) {
                existingUser.setAvatarUrl(picture);
            }
            if (name != null) {
                existingUser.setName(name);
            }
            userRepository.save(existingUser);
        }
    }
}
