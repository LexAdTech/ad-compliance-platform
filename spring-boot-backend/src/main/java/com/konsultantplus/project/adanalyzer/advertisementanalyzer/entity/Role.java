package com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "roles")
@Data
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "role", unique = true, nullable = false, length = 255)
    private String role;

    @Override
    public String toString() {
        return "Role{id=" + id + ", role='" + role + "'}";
    }
}
