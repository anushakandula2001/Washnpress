# Wash N Press User Guide

## 1. Who this guide is for
This guide is for end users operating the current web platform experience:
- Residents
- Field operators

## 2. Accessing the Platform
1. Open the app at the provided URL.
2. Use the top navigation to switch between modules:
- Dashboard
- Resident
- Operations
- Admin
- Login

Note: The current login screen is a UI scaffold and does not yet enforce a live authenticated session.

## 3. Dashboard
Path: /

What you can do:
- View platform KPIs and impact metrics
- See order lifecycle stages
- View women-led impact and sustainability cards
- Access Resident, Operations, and Admin portals quickly

## 4. Resident Portal
Path: /resident

What is available now:
- Subscription overview and plan comparison table
- Suggested pickup slot display
- Lifecycle visualization of orders
- Billing history and support ticket status cards
- Active order summary cards

Current limitation:
- Actions like Confirm Pickup or Reschedule are present in UI but not connected to a live backend transaction flow.

## 5. Operations Portal
Path: /operations

What is available now:
- Operational KPIs and offline status banner
- Quick action panel
- Kanban workflow board
- Lifecycle and queue cards
- Delivery guard-rail examples for count mismatch
- Activity feed and QR scanner shortcut button

Current limitation:
- Operational actions are UI-level and not yet persisted as live operational transactions.

## 6. Login Screen
Path: /login

Current state:
- Supports entering mobile number and OTP in UI
- Sign In and Resend OTP actions are visual controls

Current limitation:
- No active authentication/session enforcement yet

## 7. Keyboard and Navigation Features
- Command palette: Ctrl+K (Windows/Linux), Cmd+K (macOS)
- Theme toggle available in the top header
- Notification center available in the top header

## 8. Troubleshooting
### App does not start
Run:
```bash
npm install
npm run dev
```

### Port already in use
Start on a different port:
```bash
set PORT=3001 && npm run dev
```

### Build errors
Run checks and fix reported issues:
```bash
npm run lint
npm test
npm run build
```

## 9. Support
For operational issues, capture:
- Route/page where issue occurred
- Steps to reproduce
- Screenshots
- Browser/version
Then forward to the platform engineering team.
