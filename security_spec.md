# Alpino Protein Café Security Specification

## Data Invariants
1. A user cannot be assigned a plan they haven't paid for.
2. A user cannot update their own role to 'admin' or 'kitchen'.
3. Orders can only be created by users with an 'active' planStatus.
4. Users can only edit tomorrow's order before 9 PM.
5. Payment approval is restricted to 'admin' users.
6. A user's profile PII (address, phone) is only readable by the user themselves, admins, and the kitchen (for delivery).

## The Dirty Dozen (Malicious Payloads)
1. **Self-Promotion**: User attempts to update `role` to 'admin'.
2. **Ghost Plan**: User sets `planStatus` to 'active' without a payment record.
3. **Identity Theft**: User attempts to read another user's document in `/users`.
4. **Order Forgery**: User creates an order for another user ID.
5. **Time Travel**: User attempts to update an order for 'today' after the 9 PM cutoff.
6. **Payment Hijack**: User attempts to approve their own payment in `/payments`.
7. **Menu Sabotage**: Non-admin user attempts to delete or modify a menu item.
8. **PII Leak**: User attempts to list all users' private data.
9. **Role Bypass**: Guest attempts to update a plan's price.
10. **Shadow Field**: User adds `isVerified: true` to their user profile to bypass logic.
11. **Negative Payment**: User creates a payment record with a negative amount.
12. **Status Shortcut**: User updates an order status to 'delivered' directly.

## Test Runner logic
- We will verify these in `firestore.rules` via `isValidUser`, `isValidOrder`, etc.
