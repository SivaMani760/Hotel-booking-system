package com.hotel.booking.controller;

import com.hotel.booking.dto.Response;
import com.hotel.booking.model.Payment;
import com.hotel.booking.service.impl.PaymentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Response> makePayment(@RequestBody Payment payment) {
        Response response = paymentService.makePayment(payment);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getPaymentById(@PathVariable String id) {
        Response response = paymentService.getPaymentById(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping
    public ResponseEntity<Response> getAllPayments() {
        Response response = paymentService.getAllPayments();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Response> deletePayment(@PathVariable String id) {
        Response response = paymentService.deletePayment(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
