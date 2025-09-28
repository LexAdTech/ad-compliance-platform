package com.konsultantplus.project.adanalyzer.advertisementanalyzer.controller;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request.SignInRequest;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request.SignUpRequest;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.Role;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.User;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.repository.RoleRepository;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.repository.UserRepository;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.security.jwt.JwtCore;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "Аутентификация", description = "API для регистрации и авторизации пользователей")
public class SecurityController {
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationManager authenticationManager;
    private JwtCore jwtCore;
    private RoleRepository roleRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @Autowired
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
    @Autowired
    public void setAuthenticationManager(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }
    @Autowired
    public void setJwtCore(JwtCore jwtCore) {
        this.jwtCore = jwtCore;
    }

    @Autowired
    public void setRoleRepository(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }


    @Operation(summary = "Регистрация нового пользователя",
            description = "Создает нового пользователя в системе")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Пользователь успешно создан",
                    content = @Content(mediaType = "text/plain",
                            examples = @ExampleObject(value = "SignUpRequest(username=Username, email=Username@example.com, password=mySecurePassword123, role=user)"))),
            @ApiResponse(responseCode = "400", description = "Неверные данные",
                    content = @Content(mediaType = "text/plain",
                            examples = {
                                    @ExampleObject(name = "Username занят", value = "Имя пользователя username занято"),
                                    @ExampleObject(name = "Email занят", value = "Этот почтовый ящик уже используется")
                            }))
    })
    @PostMapping("/signup")
    ResponseEntity<?> signup(@RequestBody SignUpRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Имя пользователя " + signUpRequest.getUsername() + " занято, выберите другое имя.");
        }
        if (userRepository.existsByEmail(signUpRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Этот почтовый ящик уже используется, попробуйте другой");}
        String hashedPassword = passwordEncoder.encode(signUpRequest.getPassword());
        Role defaultRole = roleRepository.findByRole("USER");
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(hashedPassword);
        user.setEmail(signUpRequest.getEmail());
        user.setRole(defaultRole);
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(signUpRequest.toString());

    }

    @Operation(summary = "Авторизация пользователя",
            description = "Аутентификация пользователя и получение JWT токена")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успешная авторизация",
                    content = @Content(mediaType = "text/plain",
                            examples = @ExampleObject(value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."))),
            @ApiResponse(responseCode = "401", description = "Неверные учетные данные")
    })
    @PostMapping("/signin")
    ResponseEntity<?> signin(@RequestBody SignInRequest signInRequest) {
        Authentication authentication = null;
        try{
            authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(signInRequest.getUsername(), signInRequest.getPassword()));
        }catch (BadCredentialsException e){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtCore.generateToken(authentication);
        return ResponseEntity.ok(jwt);
    }
}
