package com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на авторизацию пользователя")
public class SignInRequest {
    @Schema(description = "Имя пользователя", example = "testuser", required = true)
    private String username;

    @Schema(description = "Пароль", example = "mySecurePassword123", required = true)
    private String password;
}
