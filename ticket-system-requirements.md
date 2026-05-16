# AI Powered Ticket Management System

## Problem

We receive hundreds of support emails daily. Our agents manually read, classify, and respond to every single ticket. This process is slow and manual, leading to impersonal, canned responses that are sometimes incorrect.

## Solution

A ticket management system that uses AI to automatically classify, respond to, and route support tickets — delivering faster, more personalized responses to users while freeing up agents for complex issues.

## Audience

Mixed audience: students, general customers, and staff submit support requests via email. They interact with the system only through email (no login required).

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full access: user management, system configuration, all tickets |
| **Supervisor / Manager** | View all tickets, reassign tickets, view agent workload and reports |
| **Agent / Support Staff** | View assigned tickets, respond, close, and escalate tickets |

## Email Integration

- **Source:** Gmail / Google Workspace inbox
- **Method:** Gmail API polling — periodically check the inbox for new messages and create tickets

## Knowledge Base

- Admins upload static documents (markdown or PDF) as the knowledge base
- AI uses this content as context when generating auto-responses and suggested replies

## Features

### Ticket Management
- Receive support emails via Gmail API and automatically create tickets
- Ticket list with filtering (by status, priority, category, assignee) and sorting
- Ticket detail view with full email thread history
- Dashboard to view and manage all tickets

**Ticket Status**
- `open` — newly received or awaiting agent response
- `resolved` — agent has responded and considers the issue handled
- `closed` — ticket is fully closed, no further action needed

**Ticket Categories** (AI-classified, one per ticket)
- `question` — general inquiries
- `technical question` — technical or product-related issues
- `refund request` — billing and refund-related requests

### AI Features
- **Auto-classification:** Automatically categorize and assign priority to incoming tickets
- **Auto-response:** Generate human-friendly replies using the knowledge base and send immediately or queue for agent review
- **AI summaries:** Summarize long ticket threads for quick agent context
- **AI-suggested replies:** Surface relevant draft responses for agents to edit and send

### User Management (Admin only)
- Create, edit, and deactivate agent and supervisor accounts
- Assign roles and manage permissions

## Deployment & Seeding

- The system is deployed with a single pre-seeded admin account
- The admin logs in and creates additional agent/supervisor accounts from within the app
- No self-registration — all accounts are created by an admin

## Scope

Full featured MVP — all features above are in scope for the first release. Tech stack TBD.
