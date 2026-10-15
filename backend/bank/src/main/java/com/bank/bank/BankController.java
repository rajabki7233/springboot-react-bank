package com.bank.bank;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BankController {

    @Autowired
    private UserRepository users;

    // ─── Register ─────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String email = body.get("email");

        if (users.existsByUsername(username))
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
        if (users.existsByEmail(email))
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));

        User user = users.save(new User(username, password, email));
        return ResponseEntity.ok(user);
    }

    // ─── Login ────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        return users.findByUsername(body.get("username"))
                .filter(u -> u.getPassword().equals(body.get("password")))
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }

    // ─── Get account ──────────────────────────────
    @GetMapping("/account/{username}")
    public ResponseEntity<?> account(@PathVariable String username) {
        return users.findByUsername(username)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Deposit ──────────────────────────────────
    @PostMapping("/deposit")
    @Transactional
    public ResponseEntity<?> deposit(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        double amount = Double.parseDouble(body.get("amount").toString());
        if (amount <= 0) return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount"));

        User u = users.findByUsername(username).orElseThrow();
        u.setBalance(u.getBalance() + amount);
        users.save(u);
        return ResponseEntity.ok(u);
    }

    // ─── Withdraw ─────────────────────────────────
    @PostMapping("/withdraw")
    @Transactional
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        double amount = Double.parseDouble(body.get("amount").toString());
        if (amount <= 0) return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount"));

        User u = users.findByUsername(username).orElseThrow();
        if (u.getBalance() < amount)
            return ResponseEntity.badRequest().body(Map.of("error", "Insufficient funds"));
        u.setBalance(u.getBalance() - amount);
        users.save(u);
        return ResponseEntity.ok(u);
    }

    // ─── Send ─────────────────────────────────────
    @PostMapping("/send")
    @Transactional
    public ResponseEntity<?> send(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        String toAccount = (String) body.get("toAccountNumber");
        double amount = Double.parseDouble(body.get("amount").toString());

        if (amount <= 0) return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount"));

        User sender = users.findByUsername(username).orElseThrow();
        if (sender.getAccountNumber().equals(toAccount))
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot send to yourself"));
        if (sender.getBalance() < amount)
            return ResponseEntity.badRequest().body(Map.of("error", "Insufficient funds"));

        User receiver = users.findByAccountNumber(toAccount)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        sender.setBalance(sender.getBalance() - amount);
        receiver.setBalance(receiver.getBalance() + amount);
        users.save(sender);
        users.save(receiver);
        return ResponseEntity.ok(sender);
    }

    // ─── All users (for testing) ──────────────────
    @GetMapping("/users")
    public List<User> allUsers() {
        return users.findAll();
    }
}