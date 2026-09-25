package in.adityasri.spring_security_backend.services;

import in.adityasri.spring_security_backend.dto.AuthResponseDto;
import in.adityasri.spring_security_backend.dto.LoginRequestDto;
import in.adityasri.spring_security_backend.dto.SignupRequestDto;
import in.adityasri.spring_security_backend.entities.AuthProvider;
import in.adityasri.spring_security_backend.entities.RefreshTokenEntity;
import in.adityasri.spring_security_backend.entities.Role;
import in.adityasri.spring_security_backend.entities.UserEntity;
import in.adityasri.spring_security_backend.exceptions.TokenRefreshException;
import in.adityasri.spring_security_backend.exceptions.UserAlreadyExistsException;
import in.adityasri.spring_security_backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public record AuthResult(AuthResponseDto responseDto, String refreshToken) {}

    @Transactional
    public AuthResult signup(SignupRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
        }

        Set<Role> roles = request.getRoles();
        if (roles == null || roles.isEmpty()) {
            roles = new HashSet<>();
            roles.add(Role.ROLE_USER);
        }

        in.adityasri.spring_security_backend.entities.AccountType accountType =
                request.getAccountType() != null ? request.getAccountType() : in.adityasri.spring_security_backend.entities.AccountType.B2C;

        UserEntity user = UserEntity.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .provider(AuthProvider.LOCAL)
                .accountType(accountType)
                .organization(request.getOrganization())
                .roles(roles)
                .build();

        UserEntity savedUser = userRepository.save(user);

        String accessToken = jwtService.generateToken(savedUser);
        RefreshTokenEntity refreshToken = refreshTokenService.createRefreshToken(savedUser);

        AuthResponseDto responseDto = AuthResponseDto.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .user(userService.mapToUserDto(savedUser))
                .build();

        return new AuthResult(responseDto, refreshToken.getToken());
    }

    @Transactional
    public AuthResult login(LoginRequestDto request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        UserEntity user = userService.getUserByEmail(request.getEmail().toLowerCase().trim());

        String accessToken = jwtService.generateToken(user);
        RefreshTokenEntity refreshToken = refreshTokenService.createRefreshToken(user);

        AuthResponseDto responseDto = AuthResponseDto.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .user(userService.mapToUserDto(user))
                .build();

        return new AuthResult(responseDto, refreshToken.getToken());
    }

    @Transactional
    public AuthResult refreshToken(String refreshTokenStr) {
        if (refreshTokenStr == null || refreshTokenStr.isBlank()) {
            throw new TokenRefreshException("Refresh token is missing");
        }

        RefreshTokenEntity existingToken = refreshTokenService.findByToken(refreshTokenStr)
                .orElseThrow(() -> new TokenRefreshException("Refresh token is not in database!"));

        refreshTokenService.verifyExpiration(existingToken);

        UserEntity user = existingToken.getUser();

        // Token rotation: Revoke current refresh token and issue a new one
        refreshTokenService.revokeToken(refreshTokenStr);
        RefreshTokenEntity newRefreshToken = refreshTokenService.createRefreshToken(user);

        String newAccessToken = jwtService.generateToken(user);

        AuthResponseDto responseDto = AuthResponseDto.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .user(userService.mapToUserDto(user))
                .build();

        return new AuthResult(responseDto, newRefreshToken.getToken());
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        if (refreshTokenStr != null && !refreshTokenStr.isBlank()) {
            refreshTokenService.revokeToken(refreshTokenStr);
        }
    }
}
