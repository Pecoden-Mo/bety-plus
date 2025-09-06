# Simplified Payment System Documentation

## Overview

The payment system has been simplified to use worker's individual pricing as the base price, with global fees and trial settings for UAE workers.

## Key Features

### 1. Simplified Pricing Model (`models/pricingModel.js`)

**Removed:**

- Region-based pricing
- Base price configuration
- Experience multipliers

**Kept:**

- Global service and delivery fees
- Trial settings for UAE workers
- Multi-currency support

### 2. Worker-Based Pricing

**Base Price Source:**

- Each worker has their own `price` field (required)
- This becomes the base price for all calculations
- No region or experience multipliers applied

### 3. Pricing Calculation

**Formula:**

```
Final Price = Worker Price + Service Fee + Delivery Fee (UAE only)
```

**Trial Deposit:**

```
Trial Deposit = (Final Price / 365) * 4 days
```

## API Response Examples

### Get Pricing Quote

```
GET /payments/quote/:workerId
```

**Response for UAE Worker:**

```json
{
  "status": "success",
  "data": {
    "worker": {
      "id": "...",
      "name": "Worker Name",
      "company": "Company Name",
      "location": "Dubai",
      "isInside": true,
      "experience": 3,
      "skills": ["cooking", "cleaning"]
    },
    "pricing": {
      "isInside": true,
      "basePrice": 15000,
      "serviceFee": 500,
      "deliveryFee": 200,
      "totalAmount": 15700,
      "currency": "AED",
      "canHaveTrial": true,
      "trialDays": 4
    },
    "paymentOptions": {
      "trial": {
        "amount": 172,
        "type": "deposit",
        "description": "4-day trial deposit",
        "trialDays": 4,
        "originalFullAmount": 15700
      },
      "full": {
        "amount": 15700,
        "type": "full",
        "description": "Full year payment"
      }
    }
  }
}
```

**Response for Outside UAE Worker:**

```json
{
  "pricing": {
    "isInside": false,
    "basePrice": 12000,
    "serviceFee": 500,
    "deliveryFee": 0,
    "totalAmount": 12500,
    "currency": "AED",
    "canHaveTrial": false
  },
  "paymentOptions": {
    "full": {
      "amount": 12500,
      "type": "full",
      "description": "Full year payment (required for outside UAE workers)"
    }
  }
}
```

## Payment Flow Examples

### UAE Worker - Trial Payment Flow

1. **Get Quote**: `GET /payments/quote/worker_id`
   - Returns both trial and full payment options based on worker's price

2. **Create Trial Payment**: `POST /payments`

   ```json
   {
     "workerId": "worker_id",
     "paymentType": "deposit"
   }
   ```

3. **Trial Period**: Worker is reserved for 4 days

4. **Complete Payment**: `POST /payments`
   ```json
   {
     "workerId": "worker_id",
     "paymentType": "remaining",
     "depositPaymentId": "deposit_payment_id"
   }
   ```

### UAE Worker - Full Payment Flow

1. **Get Quote**: `GET /payments/quote/worker_id`

2. **Create Full Payment**: `POST /payments`
   ```json
   {
     "workerId": "worker_id",
     "paymentType": "full"
   }
   ```

### Outside UAE Worker - Full Payment Only

1. **Get Quote**: `GET /payments/quote/worker_id`
   - Returns only full payment option

2. **Create Full Payment**: `POST /payments`
   ```json
   {
     "workerId": "worker_id",
     "paymentType": "full"
   }
   ```

## Pricing Calculation

### Base Price Source

```
Base Price = Worker.price (individual worker pricing)
```

### Final Price Calculation

```
Final Price = Worker Price + Service Fee + Delivery Fee (UAE only)
```

### Trial Deposit Calculation

```
Trial Deposit = (Final Price / 365) * 4 days
```

## Database Seeding

Run the simplified pricing seeder:

```bash
node utils/seedUpdatedPricing.js
```

This creates a single global pricing configuration with:

- Service Fee: 500 AED
- Delivery Fee: 200 AED (UAE only)
- Trial Days: 4 (UAE only)

## Business Rules

1. **Base Pricing**: Each worker sets their own price (required field)
2. **UAE Workers**: Can offer 4-day trial or full year payment
3. **Outside UAE Workers**: Must pay full year upfront (no trial)
4. **Service Fee**: Applied to all workers globally
5. **Delivery Fee**: Only charged for UAE workers
6. **Trial Deposit**: Calculated as 4 days worth of total pricing
7. **Currency**: Configurable per pricing setup (default AED)

## Validation

- Worker price validation ensures price is set and > 0
- Payment type validation ensures proper combinations
- Worker location validation prevents invalid trial payments
- Deposit payment linking validation for remaining payments
- User ownership validation for payment access
