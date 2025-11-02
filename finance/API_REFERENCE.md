# API Quick Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require Clerk authentication token.

---

## Income
- `GET /api/income` - List all income
- `POST /api/income` - Create income
- `GET /api/income/[id]` - Get specific income
- `PATCH /api/income/[id]` - Update income
- `DELETE /api/income/[id]` - Delete income

## Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/[id]` - Get specific expense
- `PATCH /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

## Budgets
- `GET /api/budgets` - List all budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/[id]` - Get specific budget
- `PATCH /api/budgets/[id]` - Update budget
- `DELETE /api/budgets/[id]` - Delete budget

## Goals
- `GET /api/goals` - List all goals
- `POST /api/goals` - Create goal
- `GET /api/goals/[id]` - Get specific goal
- `PATCH /api/goals/[id]` - Update goal
- `DELETE /api/goals/[id]` - Delete goal

## Analytics
- `GET /api/analytics/health` - Financial health score
- `GET /api/analytics/spending` - Spending analysis
- `GET /api/analytics/recommendations` - Personalized tips
- `GET /api/analytics/budget-recommendations` - AI budget suggestions
- `POST /api/analytics/budget-recommendations` - Create AI budgets
- `GET /api/analytics/predictions` - Expense predictions

## Fraud Detection
- `GET /api/fraud/alerts` - Get fraud alerts
- `POST /api/fraud/analyze/[id]` - Analyze expense
- `POST /api/fraud/scan` - Scan recent expenses

## Reports
- `GET /api/reports` - List all reports
- `POST /api/reports` - Generate report

## Dashboard
- `GET /api/dashboard` - Dashboard overview

---

## Common Query Parameters

### Date Filtering
```
?startDate=2024-01-01&endDate=2024-01-31
```

### Pagination (where supported)
```
?page=1&limit=20
```

### Filtering
```
?category=Food&status=ACTIVE
```

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Rate Limits
- 100 requests per 15 minutes per user
- Returns 429 when exceeded

---

## Example Requests

### Create Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 25.50,
    "category": "Food",
    "merchant": "Coffee Shop",
    "date": "2024-01-15"
  }'
```

### Get Financial Health
```bash
curl http://localhost:3000/api/analytics/health \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Generate Report
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "monthly-summary",
    "format": "csv",
    "year": 2024,
    "month": 1
  }'
```
