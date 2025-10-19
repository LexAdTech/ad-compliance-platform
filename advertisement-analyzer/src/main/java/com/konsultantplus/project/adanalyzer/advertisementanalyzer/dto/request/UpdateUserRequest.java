package com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на обновление данных пользователя")
public class UpdateUserRequest {
    @Schema(description = "Имя пользователя", example = "testuser", required = true)
    private String username;

    @Schema(description = "Email адрес", example = "testuser@example.com", required = true)
    private String email;

    @Schema(description = "Пароль", example = "mySecurePassword123", required = true)
    private String password;

}
