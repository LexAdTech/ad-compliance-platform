package com.konsultantplus.project.adanalyzer.advertisementanalyzer.config.docs;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

public class UserDocs {

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @Operation(
            summary = "Получить информацию о текущем пользователе",
            description = """
            Возвращает полную информацию об аутентифицированном пользователе на основе JWT токена.
            
            **Доступ:** Все аутентифицированные пользователи
            """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Успешное получение данных пользователя",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                        {
                            "id": 1,
                            "username": "testuser",
                            "email": "test@example.com",
                            "role": {
                                "id": 1,
                                "role": "USER"
                            }
                        }
                        """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Требуется аутентификация - неверный или отсутствующий JWT токен"
            )
    })
    public @interface UserAccessOperation {}

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @Operation(
            summary = "Получить список всех пользователей",
            description = """
            Возвращает список всех зарегистрированных пользователей в системе.
            
            **Требуемые роли:** ADMIN, MANAGER
            **Доступ:** Только для администраторов и менеджеров
            """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Успешное получение списка пользователей",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                        [
                            {
                                "id": 1,
                                "username": "admin",
                                "email": "admin@example.com",
                                "role": { "id": 1, "role": "ADMIN" }
                            },
                            {
                                "id": 2,
                                "username": "user1",
                                "email": "user1@example.com",
                                "role": { "id": 2, "role": "USER" }
                            }
                        ]
                        """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "204",
                    description = "Пользователи не найдены - база данных пуста"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Требуется аутентификация"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Недостаточно прав - требуется роль ADMIN или MANAGER"
            )
    })
    public @interface GetAllUsersOperation {}

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @Operation(
            summary = "Получить пользователя по username",
            description = """
            Возвращает информацию о конкретном пользователе по его имени.
            
            **Требуемые роли:** ADMIN, MANAGER
            **Доступ:** Только для администраторов и менеджеров
            """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @Parameters({
            @Parameter(
                    name = "username",
                    description = "Имя пользователя для поиска",
                    required = true,
                    example = "testuser"
            )
    })
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Успешное получение данных пользователя",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                        {
                            "id": 1,
                            "username": "testuser",
                            "email": "test@example.com",
                            "role": { "id": 2, "role": "USER" }
                        }
                        """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "204",
                    description = "Пользователь с указанным username не найден"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Требуется аутентификация"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Недостаточно прав - требуется роль ADMIN или MANAGER"
            )
    })
    public @interface GetUserByUsernameOperation {}

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @Operation(
            summary = "Редактировать данные пользователя",
            description = """
            Обновляет информацию пользователя. Пользователь может редактировать только свой профиль.
            
            **Ограничения:**
            - Пользователь может редактировать только свой профиль
            - Проверка уникальности username и email
            - Пароль хешируется при обновлении
            
            **Доступ:** Все аутентифицированные пользователи (только свой профиль)
            """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @Parameters({
            @Parameter(
                    name = "username",
                    description = "Имя пользователя для редактирования (должно совпадать с именем в токене)",
                    required = true,
                    example = "current_user"
            )
    })
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Профиль успешно обновлен",
                    content = @Content(
                            mediaType = "text/plain",
                            examples = @ExampleObject(value = "Профиль успешно обновлен")
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
                                            value = "Имя пользователя newusername занято, выберите другое имя."
                                    ),
                                    @ExampleObject(
                                            name = "Email занят",
                                            value = "Этот почтовый ящик уже используется, попробуйте другой"
                                    )
                            }
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Требуется аутентификация"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Доступ запрещен - можно редактировать только свой профиль",
                    content = @Content(
                            mediaType = "text/plain",
                            examples = @ExampleObject(value = "Вы можете редактировать только свой профиль")
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Пользователь не найден"
            )
    })
    public @interface UpdateUserOperation {}

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @Operation(
            summary = "Удалить пользователя по username",
            description = """
            Удаляет пользователя из системы. Пользователь может удалить только свой аккаунт.
            
            **Ограничения:**
            - Пользователь может удалить только свой профиль
            - Удаление происходит только при совпадении username с токеном
            
            **Доступ:** Все аутентифицированные пользователи (только свой профиль)
            """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @Parameters({
            @Parameter(
                    name = "username",
                    description = "Имя пользователя для удаления (должно совпадать с именем в токене)",
                    required = true,
                    example = "current_user"
            )
    })
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Пользователь успешно удален",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                        {
                            "id": 1,
                            "username": "deleteduser",
                            "email": "deleted@example.com",
                            "role": { "id": 2, "role": "USER" }
                        }
                        """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Требуется аутентификация"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Доступ запрещен - можно удалить только свой профиль"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Пользователь не найден"
            )
    })
    public @interface DeleteUserOperation {}
}