package com.hotel.booking.service.impl;

import com.hotel.booking.dto.Response;
import com.hotel.booking.model.Payment;
import com.hotel.booking.repository.PaymentRepository;
import com.hotel.booking.service.interfac.IPaymentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService implements IPaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    public Response makePayment(Payment payment) {
        Response response = new Response();
        try {
            Payment saved = paymentRepository.save(payment);
            response.setStatusCode(200);
            response.setMessage("Payment successful");
            response.setPayment(saved);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error making payment: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getPaymentById(String id) {
        Response response = new Response();
        try {
            Long paymentId = Long.parseLong(id);
            Payment payment = paymentRepository.findById(paymentId).orElse(null);
            if (payment == null) {
                response.setStatusCode(404);
                response.setMessage("Payment not found");
            } else {
                response.setStatusCode(200);
                response.setMessage("Payment retrieved");
                response.setPayment(payment);
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving payment: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getAllPayments() {
        Response response = new Response();
        try {
            List<Payment> payments = paymentRepository.findAll();
            response.setStatusCode(200);
            response.setMessage("Payments retrieved");
            response.setPaymentList(payments);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving payments: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response deletePayment(String id) {
        Response response = new Response();
        try {
            Long paymentId = Long.parseLong(id);
            if (!paymentRepository.existsById(paymentId)) {
                response.setStatusCode(404);
                response.setMessage("Payment not found");
            } else {
                paymentRepository.deleteById(paymentId);
                response.setStatusCode(200);
                response.setMessage("Payment deleted successfully");
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting payment: " + e.getMessage());
        }
        return response;
    }
}
