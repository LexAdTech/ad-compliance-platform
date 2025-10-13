package com.konsultantplus.project.adanalyzer.advertisementanalyzer.service;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request.SignInRequest;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request.SignUpRequest;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request.UpdateUserRequest;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.Role;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.User;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.repository.RoleRepository;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.repository.UserRepository;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.security.UserDetailsImpl;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.security.jwt.JwtCore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.security.Principal;
import java.util.List;

@Slf4j
@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtCore jwtCore;

    @Autowired
    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       RoleRepository roleRepository,
                       @Lazy AuthenticationManager authenticationManager,
                       JwtCore jwtCore) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.authenticationManager = authenticationManager;
        this.jwtCore = jwtCore;
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findUserByUsername(username).orElseThrow(() -> new UsernameNotFoundException(
                String.format("User %s not found", username)
        ));
        return UserDetailsImpl.build(user);
    }

    public ResponseEntity<?> signUp(@RequestBody SignUpRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Имя пользователя " + signUpRequest.getUsername() + " занято, выберите другое имя.");
        }
        if (userRepository.existsByEmail(signUpRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Этот почтовый ящик уже используется, попробуйте другой");
        }
        String hashedPassword = passwordEncoder.encode(signUpRequest.getPassword());
        Role defaultRole = roleRepository.findByRole("USER");
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(hashedPassword);
        user.setEmail(signUpRequest.getEmail());
        user.setRole(defaultRole);
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    public ResponseEntity<?> signIn(@RequestBody SignInRequest signInRequest) {
        Authentication authentication = null;
        try {
            authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(signInRequest.getUsername(), signInRequest.getPassword()));
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtCore.generateToken(authentication);
        return ResponseEntity.ok(jwt);
    }

    public ResponseEntity<?> userAccess(Principal principal) {
        if (principal == null) {
            return null;
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.findUserByUsername(principal.getName()));
    }

    public ResponseEntity<List<User>> getAllUsers() {
        if (userRepository.findAll().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok().body(userRepository.findAll());
    }

    public ResponseEntity<?> getUserByUsername(String username) {
        if (userRepository.findUserByUsername(username).isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok().body(userRepository.findUserByUsername(username));
    }

    public ResponseEntity<?> updateUser(@RequestBody UpdateUserRequest updateUserRequest,
                                        @PathVariable String username,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        // Проверяем, что пользователь редактирует только свой профиль
        if (!userDetails.getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Вы можете редактировать только свой профиль");
        }

        if (userRepository.existsByUsername(updateUserRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Имя пользователя " + updateUserRequest.getUsername() + " занято, выберите другое имя.");
        }

        if (userRepository.existsByEmail(updateUserRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Этот почтовый ящик уже используется, попробуйте другой");
        }
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        if (updateUserRequest.getPassword() != null && !updateUserRequest.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(updateUserRequest.getPassword());
            user.setPassword(hashedPassword);
        }

        user.setUsername(updateUserRequest.getUsername());
        user.setEmail(updateUserRequest.getEmail());
        userRepository.save(user);

        return ResponseEntity.ok("Профиль успешно обновлен");
    }

    public ResponseEntity<?> deleteUserByUsername(String username, Principal principal) {

        if (!principal.getName().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
        User user = userRepository.findUserByUsername(username).orElse(null);
        assert user != null;
        userRepository.delete(user);
        return ResponseEntity.ok().body(user);
    }
}


