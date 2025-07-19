package com.hotel.booking.service.interfac;

import com.hotel.booking.model.Payment;
import com.hotel.booking.dto.Response;

public interface IPaymentService {
    Response makePayment(Payment payment);
    Response getPaymentById(String id);
    Response getAllPayments();
    Response deletePayment(String id);
}
