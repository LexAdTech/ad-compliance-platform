package com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на регистрацию пользователя")
public class SignUpRequest {
    @Schema(description = "Имя пользователя", example = "testuser", required = true)
    private String username;

    @Schema(description = "Email адрес", example = "testuser@example.com", required = true)
    private String email;

    @Schema(description = "Пароль", example = "mySecurePassword123", required = true)
    private String password;

//    @Schema(description = "Роль пользователя", example = "user", allowableValues = {"user", "manager", "admin"})
//    private Role role;
}
