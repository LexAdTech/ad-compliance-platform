package com.konsultantplus.project.adanalyzer.advertisementanalyzer.controller;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.User;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/secured")
@Tag(name = "Защищенные эндпоинты", description = "API требующие JWT аутентификации")
public class MainController {
    private final UserService userService;

    public MainController(UserService userService) {
        this.userService = userService;
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
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{username}")
    public User getUser(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }

//    @PutMapping("/user/update/{username}")
//    public User updateUser(@PathVariable String username, @RequestBody User user) {
//        username = user.getUsername();
//        return userService.updateUser(user);
//    }

}
