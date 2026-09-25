package in.adityasri.spring_security_backend.config.oauth2;

import in.adityasri.spring_security_backend.entities.AuthProvider;
import in.adityasri.spring_security_backend.entities.RefreshTokenEntity;
import in.adityasri.spring_security_backend.entities.Role;
import in.adityasri.spring_security_backend.entities.UserEntity;
import in.adityasri.spring_security_backend.repositories.UserRepository;
import in.adityasri.spring_security_backend.services.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.jwt.refresh-token-expiration-days:7}")
    private long refreshTokenExpirationDays;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        if (email == null) {
            log.error("Email not found from OAuth2 provider");
            response.sendRedirect(frontendUrl + "/login?error=oauth_email_missing");
            return;
        }

        email = email.toLowerCase().trim();
        final String finalEmail = email;

        UserEntity user = userRepository.findByEmail(finalEmail)
                .orElseGet(() -> {
                    Set<Role> roles = new HashSet<>();
                    roles.add(Role.ROLE_USER);
                    UserEntity newUser = UserEntity.builder()
                            .email(finalEmail)
                            .name(name != null ? name : "Google User")
                            .avatarUrl(picture)
                            .provider(AuthProvider.GOOGLE)
                            .roles(roles)
                            .build();
                    return userRepository.save(newUser);
                });

        RefreshTokenEntity refreshToken = refreshTokenService.createRefreshToken(user);

        boolean isSecure = request.isSecure();
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                .httpOnly(true)
                .secure(isSecure)
                .path("/api/v1/auth")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(refreshTokenExpirationDays))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        String targetUrl = frontendUrl + "/oauth2/redirect";
        String origin = request.getHeader("Origin");
        String referer = request.getHeader("Referer");
        if ((origin != null && origin.contains("5174")) || (referer != null && referer.contains("5174"))) {
            targetUrl = "http://localhost:5174/oauth2/redirect";
        }

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
