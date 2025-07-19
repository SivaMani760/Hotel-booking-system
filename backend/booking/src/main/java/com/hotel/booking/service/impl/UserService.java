package com.hotel.booking.service.impl;

import com.hotel.booking.dto.LoginRequest;
import com.hotel.booking.dto.Response;
import com.hotel.booking.dto.UserDTO;
import com.hotel.booking.model.User;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.security.JWTUtils;
import com.hotel.booking.service.interfac.IUserService;
import com.hotel.booking.utils.Utils;

import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService implements IUserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JWTUtils jwtUtils;


 // UserService.java
    @Override
    public Response register(User user) {
        Response response = new Response();
        try {
            if (userRepository.existsByEmail(user.getEmail())) {
                response.setStatusCode(400);
                response.setMessage("Email already exists");
                return response;
            }
            // Ensure role is prefixed with ROLE_ before saving
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("ROLE_USER");
            } else if (!user.getRole().startsWith("ROLE_")) { // <-- ADD THIS CONDITION
                user.setRole("ROLE_" + user.getRole()); // Prefix if missing
            }

            User savedUser = userRepository.save(user);
            UserDTO userDTO = Utils.mapUserEntityToUserDTO(savedUser);

            // Generate token after saving user
            String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getRole()); // Pass the ROLE_ prefixed role

            response.setStatusCode(200);
            response.setMessage("Registration successful");
            response.setUser(userDTO);
            response.setToken(token); // Ensure token is returned
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error during registration: " + e.getMessage());
        }
        return response;
    }


    @Override
    public Response login(LoginRequest loginRequest) {
        Response response = new Response();
        try {
            User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);

            if (user == null || !user.getPassword().equals(loginRequest.getPassword())) {
                response.setStatusCode(401);
                response.setMessage("Invalid email or password");
                return response;
            }

            // Credentials are valid
            UserDTO userDTO = Utils.mapUserEntityToUserDTO(user);
            String token = jwtUtils.generateToken(user.getEmail(), user.getRole());

            response.setStatusCode(200);
            response.setMessage("Login successful");
            response.setUser(userDTO);
            response.setToken(token);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error during login: " + e.getMessage());
        }
        return response;
    }


    @Override
    public Response getAllUsers() {
        Response response = new Response();
        try {
            List<User> userList = userRepository.findAll();
            List<UserDTO> dtoList = Utils.mapUserListEntityToUserListDTO(userList);
            response.setStatusCode(200);
            response.setMessage("Users retrieved");
            response.setUserList(dtoList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching users: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getUserById(String id) {
        Response response = new Response();
        try {
            Long userId = Long.parseLong(id);
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                response.setStatusCode(404);
                response.setMessage("User not found");
            } else {
                UserDTO dto = Utils.mapUserEntityToUserDTO(user);
                response.setStatusCode(200);
                response.setMessage("User found");
                response.setUser(dto);
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching user: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response deleteUser(String userId) {
        Response response = new Response();
        try {
            Long id = Long.parseLong(userId);
            if (!userRepository.existsById(id)) {
                response.setStatusCode(404);
                response.setMessage("User not found");
            } else {
                userRepository.deleteById(id);
                response.setStatusCode(200);
                response.setMessage("User deleted successfully");
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting user: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getUserBookingHistory(String userId) {
        Response response = new Response();
        try {
            Long id = Long.parseLong(userId);
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                response.setStatusCode(404);
                response.setMessage("User not found");
            } else {
                UserDTO dto = Utils.mapUserEntityToUserDTO(user);
                dto.setBookings(
                	    user.getBookings().stream()
                	        .map(Utils::mapBookingToDetailedDTO)
                	        .collect(Collectors.toList())
                	);

                response.setStatusCode(200);
                response.setMessage("User bookings retrieved");
                response.setUser(dto);
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching booking history: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getMyInfo(String email) {
        Response response = new Response();
        try {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                response.setStatusCode(404);
                response.setMessage("User not found");
            } else {
                UserDTO dto = Utils.mapUserEntityToUserDTO(user);
                response.setStatusCode(200);
                response.setMessage("User info retrieved");
                response.setUser(dto);
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching user info: " + e.getMessage());
        }
        return response;
    }
}
