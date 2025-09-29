package com.konsultantplus.project.adanalyzer.advertisementanalyzer.controller;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request.UpdateUserRequest;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.User;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.repository.RoleRepository;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.repository.UserRepository;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.security.jwt.JwtCore;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/secured")
@Tag(name = "Защищенные эндпоинты", description = "API требующие JWT аутентификации")
public class MainController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public MainController(UserService userService, UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtCore jwtCore, RoleRepository roleRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @Operation(summary = "Получить информацию о текущем пользователе",
            description = "Возвращает имя аутентифицированного пользователя",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успешное получение данных"),
            @ApiResponse(responseCode = "401", description = "Требуется аутентификация")
    })

    @GetMapping("/user")
    public String userAccess(Principal principal) {
        if (principal == null) {
            return null;
        }
        return principal.getName();
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }


    @GetMapping("/users/{username}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public User getUser(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }

    @PutMapping("/{username}/edit")
    public ResponseEntity<?> updateUser(@RequestBody UpdateUserRequest updateUserRequest,
                                        @PathVariable String username,
                                        Principal principal) {

        // Проверяем, что пользователь редактирует только свой профиль
        if (!principal.getName().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Вы можете редактировать только свой профиль");
        }

        // Остальная логика...
        if (userRepository.existsByUsername(updateUserRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Имя пользователя " + updateUserRequest.getUsername() + " занято, выберите другое имя.");
        }

        if (userRepository.existsByEmail(updateUserRequest.getEmail())) { // Исправлено: должно быть getEmail()
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Этот почтовый ящик уже используется, попробуйте другой");
        }

        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // Хешируем пароль только если он предоставлен
        if (updateUserRequest.getPassword() != null && !updateUserRequest.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(updateUserRequest.getPassword());
            user.setPassword(hashedPassword);
        }

        user.setUsername(updateUserRequest.getUsername());
        user.setEmail(updateUserRequest.getEmail());
        userRepository.save(user);

        return ResponseEntity.ok("Профиль успешно обновлен");
    }

    @DeleteMapping("/{username}/delete")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        return userService.deleteUserByUsername(username);
    }
}