package com.konsultantplus.project.adanalyzer.advertisementanalyzer.controller;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.config.docs.UserDocs;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request.UpdateUserRequest;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.User;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/secured")
@Tag(name = "Защищенные эндпоинты", description = "API требующие JWT аутентификации")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @UserDocs.UserAccessOperation
    @GetMapping("/user")
    public ResponseEntity<?> userAccess(Principal principal) {
        return userService.userAccess(principal);
    }

    @UserDocs.GetAllUsersOperation
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<User>> getAllUsers() {
        return userService.getAllUsers();
    }


    @UserDocs.GetUserByUsernameOperation
    @GetMapping("/users/{username}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> getUser(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }


    @UserDocs.UpdateUserOperation
    @PutMapping("/{username}/edit")
    public ResponseEntity<?> updateUser(@RequestBody UpdateUserRequest updateUserRequest, @PathVariable String username, @AuthenticationPrincipal UserDetails userDetails) {
        return userService.updateUser(updateUserRequest, username, userDetails);
    }

    @UserDocs.DeleteUserOperation
    @DeleteMapping("/{username}/delete")
    public ResponseEntity<?> deleteUser(@PathVariable String username, Principal principal) {
        return userService.deleteUserByUsername(username, principal);
    }
}