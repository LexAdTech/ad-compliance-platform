package com.konsultantplus.project.adanalyzer.advertisementanalyzer.config.docs;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

public class SecurityDocs {

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @Operation(
            summary = "Регистрация нового пользователя",
            description = """
            Создает нового пользователя в системе. После успешной регистрации пользователь получает роль USER по умолчанию.
            
            **Валидация:**
            - Имя пользователя должно быть уникальным
            - Email должен быть уникальным
            - Пароль хешируется перед сохранением
            """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Пользователь успешно создан",
                    content = @Content(
                            mediaType = "text/plain",
                            examples = @ExampleObject(
                                    value = "SignUpRequest(username=testuser, email=test@example.com, password=********)"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Неверные данные или конфликт уникальности",
                    content = @Content(
                            mediaType = "text/plain",
                            examples = {
                                    @ExampleObject(
                                            name = "Username занят",
                                            value = "Имя пользователя testuser занято, выберите другое имя."
                                    ),
                                    @ExampleObject(
                                            name = "Email занят",
                                            value = "Этот почтовый ящик уже используется, попробуйте другой"
                                    )
                            }
                    )
            )
    })
    public @interface SignUpOperation {}

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @Operation(
            summary = "Авторизация пользователя",
            description = """
            Аутентификация пользователя в системе. При успешной аутентификации возвращает JWT токен для доступа к защищенным endpoint'ам.
            
            **Процесс:**
            - Проверка учетных данных через AuthenticationManager
            - Установка аутентификации в SecurityContext
            - Генерация JWT токена
            """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Успешная авторизация, возвращен JWT токен",
                    content = @Content(
                            mediaType = "text/plain",
                            examples = @ExampleObject(
                                    value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTY5..."
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Неверные учетные данные (неправильное имя пользователя или пароль)",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = "")
                    )
            )
    })
    public @interface SignInOperation {}
}