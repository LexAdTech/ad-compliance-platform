package com.konsultantplus.project.adanalyzer.advertisementanalyzer.dto.request;

import lombok.Data;

@Data
public class SignUpRequest {
    private String username;
    private String email;
    private String password;
    private String role;
}
