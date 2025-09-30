package com.konsultantplus.project.adanalyzer.advertisementanalyzer.controller;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.config.docs.SecurityDocs;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request.SignInRequest;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request.SignUpRequest;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "Аутентификация", description = "API для регистрации и авторизации пользователей")
public class SecurityController {

    private UserService userService;

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    @SecurityDocs.SignUpOperation
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest signUpRequest) {
        return userService.signUp(signUpRequest);
    }

    @SecurityDocs.SignInOperation
    @PostMapping("/signin")
    ResponseEntity<?> signIn(@RequestBody SignInRequest signInRequest){
        return userService.signIn(signInRequest);
    }

}
