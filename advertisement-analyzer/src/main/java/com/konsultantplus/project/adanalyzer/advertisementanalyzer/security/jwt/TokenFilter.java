package com.konsultantplus.project.adanalyzer.advertisementanalyzer.security.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(TokenFilter.class);

    private final JwtCore jwtCore;
    private final UserDetailsService userDetailsService;

    @Autowired
    public TokenFilter(JwtCore jwtCore, UserDetailsService userDetailsService) {
        this.jwtCore = jwtCore;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String jwt = null;
        String username = null;

        try {
            String authHeader = request.getHeader("Authorization");
            logger.debug("Authorization header: {}", authHeader);

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
                logger.debug("JWT token extracted: {}", jwt);

                if (jwt != null) {
                    try {
                        username = jwtCore.getNameFromJwt(jwt);
                        logger.debug("Username from token: {}", username);

                        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities() // Важно доба authorities!
                            );

                            SecurityContextHolder.getContext().setAuthentication(auth);
                            logger.debug("Authentication set for user: {}", username);
                        }
                    } catch (ExpiredJwtException e) {
                        logger.warn("JWT token is expired: {}", e.getMessage());
                    } catch (SignatureException e) {
                        logger.warn("Invalid JWT signature: {}", e.getMessage());
                    } catch (MalformedJwtException e) {
                        logger.warn("Invalid JWT token: {}", e.getMessage());
                    } catch (Exception e) {
                        logger.error("Error processing JWT token: {}", e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error in TokenFilter: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}