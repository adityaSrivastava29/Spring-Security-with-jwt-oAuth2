package in.adityasri.spring_security_backend.services;

import in.adityasri.spring_security_backend.dto.UpdateProfileDto;
import in.adityasri.spring_security_backend.dto.UserDto;
import in.adityasri.spring_security_backend.entities.AccountType;
import in.adityasri.spring_security_backend.entities.Role;
import in.adityasri.spring_security_backend.entities.UserEntity;
import in.adityasri.spring_security_backend.exceptions.ResourceNotFoundException;
import in.adityasri.spring_security_backend.repositories.RefreshTokenRepository;
import in.adityasri.spring_security_backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .collect(Collectors.toList());

        return new User(
                user.getEmail(),
                user.getPassword() != null ? user.getPassword() : "",
                user.isEnabled(),
                true,
                true,
                true,
                authorities
        );
    }

    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public UserDto getUserProfile(String email) {
        UserEntity user = getUserByEmail(email);
        return mapToUserDto(user);
    }

    @Transactional
    public UserDto updateProfile(String email, UpdateProfileDto dto) {
        UserEntity user = getUserByEmail(email);
        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName().trim());
        }
        if (dto.getOrganization() != null) {
            user.setOrganization(dto.getOrganization().trim());
        }
        UserEntity updated = userRepository.save(user);
        return mapToUserDto(updated);
    }

    public UserDto getUserById(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserDto(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUserRoles(Long id, Set<Role> roles) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setRoles(roles);
        UserEntity saved = userRepository.save(user);
        return mapToUserDto(saved);
    }

    @Transactional
    public UserDto toggleUserStatus(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setEnabled(!user.isEnabled());
        UserEntity saved = userRepository.save(user);
        return mapToUserDto(saved);
    }

    @Transactional
    public UserDto updateUserAccountType(Long id, AccountType accountType) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setAccountType(accountType);
        UserEntity saved = userRepository.save(user);
        return mapToUserDto(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        refreshTokenRepository.deleteByUser(user);
        userRepository.delete(user);
    }

    public UserDto mapToUserDto(UserEntity user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()))
                .provider(user.getProvider())
                .accountType(user.getAccountType() != null ? user.getAccountType() : AccountType.B2C)
                .enabled(user.isEnabled())
                .organization(user.getOrganization())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
