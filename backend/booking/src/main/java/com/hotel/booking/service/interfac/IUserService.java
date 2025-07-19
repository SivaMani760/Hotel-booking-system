package com.hotel.booking.service.interfac;

import com.hotel.booking.model.User;


import com.hotel.booking.dto.Response;
import com.hotel.booking.dto.LoginRequest;

public interface IUserService {
    Response register(User user);
    Response login(LoginRequest loginRequest);
    Response getAllUsers();
    Response getUserById(String userId);
    Response getUserBookingHistory(String userId);
    Response deleteUser(String userId);
    Response getMyInfo(String email);
}

