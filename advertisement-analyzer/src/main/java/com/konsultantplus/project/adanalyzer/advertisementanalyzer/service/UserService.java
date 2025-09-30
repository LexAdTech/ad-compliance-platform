package com.konsultantplus.project.adanalyzer.advertisementanalyzer.service;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.User;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.repository.UserRepository;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
//    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
//        this.passwordEncoder = passwordEncoder;
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findUserByUsername(username).orElseThrow(() -> new UsernameNotFoundException(
                String.format("User %s not found", username)
        ));
        return UserDetailsImpl.build(user);
    }


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserByUsername(String username) {
        return userRepository.findUserByUsername(username).orElse(null);
    }

    public ResponseEntity<?> deleteUserByUsername(String username) {

        User user = userRepository.findUserByUsername(username).orElse(null);
        assert user != null;
        userRepository.delete(user);
        return ResponseEntity.ok().body(user);
    }
}


