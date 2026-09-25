package in.adityasri.spring_security_backend.controllers;

import in.adityasri.spring_security_backend.advices.ApiResponse;
import in.adityasri.spring_security_backend.dto.AuthResponseDto;
import in.adityasri.spring_security_backend.dto.LoginRequestDto;
import in.adityasri.spring_security_backend.dto.SignupRequestDto;
import in.adityasri.spring_security_backend.exceptions.TokenRefreshException;
import in.adityasri.spring_security_backend.services.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.refresh-token-expiration-days:7}")
    private long refreshTokenExpirationDays;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponseDto>> signup(
            @Valid @RequestBody SignupRequestDto signupRequestDto,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        AuthService.AuthResult result = authService.signup(signupRequestDto);
        setRefreshTokenCookie(response, result.refreshToken(), request.isSecure());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully", result.responseDto()));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(
            @Valid @RequestBody LoginRequestDto loginRequestDto,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        AuthService.AuthResult result = authService.login(loginRequestDto);
        setRefreshTokenCookie(response, result.refreshToken(), request.isSecure());
        return ResponseEntity.ok(ApiResponse.ok("Login successful", result.responseDto()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponseDto>> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new TokenRefreshException("Refresh token cookie is missing");
        }

        AuthService.AuthResult result = authService.refreshToken(refreshToken);
        setRefreshTokenCookie(response, result.refreshToken(), request.isSecure());
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed successfully", result.responseDto()));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        authService.logout(refreshToken);
        clearRefreshTokenCookie(response, request.isSecure());
        return ResponseEntity.ok(ApiResponse.ok("Logout successful"));
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token, boolean isSecure) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(isSecure)
                .path("/api/v1/auth")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(refreshTokenExpirationDays))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response, boolean isSecure) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(isSecure)
                .path("/api/v1/auth")
                .sameSite("Lax")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
