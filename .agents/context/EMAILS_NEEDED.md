# Emails Needed

This document tracks the necessary email templates and notification triggers required for the HaloKYC platform.

## 1. Client Onboarding & Account Management
- [ ] **Welcome Email**: Sent after a Client account is created. Includes login link, dashboard introduction, and quick-start guide.
- [ ] **Account Activation**: Confirmation email for account verification/activation.
- [ ] **Password Reset**: Request and completion emails for password recovery.
- [ ] **New Login Alert**: Security notification when a Client account is accessed from a new device or IP.

## 2. Billing & Credit Management
- [ ] **Low Credit Alert**: Notification when a Client's balance falls below a certain threshold (e.g., 10% of monthly plan).
- [ ] **Payment Success / Invoice**: Delivery of the invoice and confirmation of credit top-up/subscription renewal.
- [ ] **Payment Failed**: Alert when a subscription payment fails, including a link to update billing details.
- [ ] **Account Suspension (Billing)**: Notification that API access has been paused due to overdue payments or zero credits.
- [ ] **Monthly Usage Summary**: A report sent to the Client summarizing verification volume and credit consumption.

## 3. API & Developer Notifications
- [ ] **API Key Created/Rotated**: Security notification whenever a new API key is generated or an existing one is revoked.
- [ ] **Webhook Failure Alert**: Notification to the Client if their webhook endpoint is consistently returning errors (e.g., 5xx).

## 4. Verification Flow Notifications (B2B)
- [ ] **Manual Review Required**: Notification to the Client's reviewer when a session enters the `manual_review` state.
- [ ] **System Error Alert**: Notification if a high-priority verification session fails due to a system error.

## 5. Compliance & Legal
- [ ] **Privacy Policy / Terms Update**: Broadcast email informing all Clients of material changes to the Legal Terms or Privacy Policy.
- [ ] **Data Erasure Confirmation**: Confirmation sent to a user/client when a "Right to be Forgotten" request has been processed.
- [ ] **DPA Agreement Request**: Request for the Client to sign the Data Processing Agreement.

## 6. Support & Platform Admin
- [ ] **Support Ticket Received**: Auto-responder when a Client submits a support request.
- [ ] **Platform Maintenance Notice**: Notification of scheduled downtime or major API version deprecations.

## 7. Required Email Addresses

### Public & Legal
- `hello@halokyc.com` — General inquiries and sales.
- `privacy@halokyc.com` — Privacy requests, GDPR/CCPA/DPDP, data erasure.
- `legal@halokyc.com` — Terms, contracts, and DPA.
- `security@halokyc.com` — Vulnerability reporting.

### Operational & Support
- `support@halokyc.com` — Client technical support.
- `billing@halokyc.com` — Invoices and subscription queries.
- `no-reply@halokyc.com` — Automated system notifications.

### Administrative
- `admin@halokyc.com` — Platform admin and critical system alerts.
