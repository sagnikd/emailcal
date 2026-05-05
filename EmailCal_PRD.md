# EmailCal — Product Requirements Document

**The Email Marketing Calendar Built for Modern Teams**

> Version 1.0 | May 2026 | Status: Draft

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Goals & Success Metrics](#4-goals--success-metrics)
5. [Core Features — P0 (Must Have)](#5-core-features--p0-must-have)
6. [Secondary Features — P1 (Should Have)](#6-secondary-features--p1-should-have)
7. [Future Features — P2 (Nice to Have)](#7-future-features--p2-nice-to-have)
8. [User Experience Principles](#8-user-experience-principles)
9. [Information Architecture](#9-information-architecture)
10. [Technical Requirements](#10-technical-requirements)
11. [Non-Goals (Out of Scope for V1)](#11-non-goals-out-of-scope-for-v1)
12. [Timeline & Milestones](#12-timeline--milestones)
13. [Open Questions](#13-open-questions)

---

## 1. Product Overview

**EmailCal** is a visual email marketing calendar that lets marketing teams plan, schedule, track, and collaborate on email campaigns in one intuitive interface.

Instead of juggling spreadsheets, email threads, and disconnected project tools, marketing teams get a single shared workspace where every scheduled email is visible, organized, and up to date — from first draft to post-send reporting.

---

## 2. Problem Statement

Marketing teams rely on disconnected tools to plan email campaigns — spreadsheets for schedules, email threads for approvals, and separate project management apps for task tracking. This creates:

- **Missed sends** due to no single source of truth
- **Duplicate or conflicting emails** sent to the same audience
- **Poor team visibility** — no one knows what's going out this week
- **Slow approvals** — reviews happen over email with no audit trail
- **Zero post-send learning** — performance data lives in the ESP, disconnected from planning

EmailCal solves all of this with a calendar-first, collaboration-native planning layer built specifically for email marketers.

---

## 3. Target Users

| Role | Primary Use | Key Need |
|---|---|---|
| **Email Marketing Manager** | Day-to-day scheduling & execution | Full control over the calendar |
| **Content Strategist** | Planning content themes & copy | Visibility into upcoming sends |
| **Campaign Coordinator** | Tracking status across campaigns | Status pipeline & task ownership |
| **Marketing Director** | Oversight & reporting | Read-only view + performance summary |

---

## 4. Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| Faster campaign planning | Time to plan a monthly calendar | 40% reduction |
| Zero scheduling errors | Missed or duplicate sends | 0 per month |
| High team adoption | Active users / invited users | >90% within 30 days |
| Single source of truth | % of emails tracked in EmailCal | 100% |
| Team alignment | Time spent in planning meetings | 25% reduction |

---

## 5. Core Features — P0 (Must Have)

### 5.1 Visual Calendar View

A drag-and-drop calendar with month / week / day toggle.

- Each email appears as a color-coded chip on its send date
- Color codes by: Campaign, Audience Segment, or Send Status (user-configurable)
- Click any chip to open the Email Card
- Drag to reschedule
- Multi-user cursors visible in real time

**Acceptance Criteria:** User can view all emails for the current month, switch views, and drag an email to a new date within 3 clicks.

---

### 5.2 Email Entry Card

A quick-add form that captures everything needed to plan a send.

| Field | Type | Required |
|---|---|---|
| Subject Line | Text | Yes |
| Send Date & Time | Date/time picker | Yes |
| Target Audience / Segment | Tag select | Yes |
| Campaign | Dropdown | Yes |
| Email Type | Select (Newsletter, Promo, Drip, Transactional) | Yes |
| Status | Select (Draft, Review, Approved, Scheduled, Sent, Paused) | Yes |
| Assigned Owner | User mention | Yes |
| Preview Text | Text | No |
| Notes / Brief | Rich text | No |
| Attachments | File upload | No |

**Acceptance Criteria:** New user can create their first email card within 60 seconds of signing up.

---

### 5.3 Campaign Grouping

Emails are organized under campaign umbrellas.

- Create a campaign with name, dates, color, and goal
- All emails tagged to a campaign are grouped and visually linked
- Campaign card shows: total emails, sends completed, next scheduled send, audience overlap alerts
- Campaigns appear in a sidebar rail for quick filtering

**Acceptance Criteria:** User can filter the calendar to show only emails from one campaign with a single click.

---

### 5.4 Status Tracking Pipeline

A structured workflow for every email from idea to report.

```
Draft → In Review → Approved → Scheduled → Sent → Reported
```

- Each stage has a visual badge on the calendar chip
- Owners can move status forward; only Admins can move backward
- Status change triggers an activity log entry + optional notification
- Pipeline view (Kanban-style) available as an alternative to calendar

**Acceptance Criteria:** Team lead can see all emails currently in "In Review" status in under 10 seconds.

---

### 5.5 Team Collaboration

Real-time, in-context collaboration without leaving the tool.

- **Comments** on any email card with @mention support
- **Activity feed** per email and per campaign showing all changes
- **Role-based permissions:**
  - Admin — full edit + settings
  - Editor — create, edit, move status
  - Viewer — read-only, can comment
- **Notification center** — in-app alerts for mentions, status changes, approaching send dates

**Acceptance Criteria:** A Viewer can leave a comment on an email card and the assigned owner receives an in-app notification within 5 seconds.

---

### 5.6 Conflict Detection (Send Fatigue Warnings)

Automatic alerts when the same audience receives too many emails too close together.

- Alert fires when two emails target overlapping segments within a configurable window (default: 48 hours)
- Warning displayed on the calendar chip and inside the email card
- Team Admin can configure the time window (24h / 48h / 72h / 7 days)
- Conflicts do not block sending — they surface as warnings only

**Acceptance Criteria:** System detects and displays a conflict badge when two emails to the same segment are scheduled within the configured window.

---

### 6.2 List / Table View

A spreadsheet-style view for power users who need to bulk-edit or filter.

- Columns: Subject, Campaign, Segment, Send Date, Status, Owner, Open Rate
- Inline editable cells
- Sort and filter by any column
- Bulk status update

---

### 6.3 Recurring Emails

Template-based scheduling for repeating sends.

- Set a recurrence pattern: daily, weekly, bi-weekly, monthly
- Each instance is a separate email card (editable independently)
- Editing the template propagates changes to future instances (with confirmation)


---

### 6.5 Export

Shareable outputs for stakeholder reporting.

- Export calendar view as PDF (month/week)
- Export email list as CSV with all fields
- Scheduled export: auto-generate and email a PDF report every Monday


---

## 8. User Experience Principles

### Zero Learning Curve
A new user adds their first email within 60 seconds. No onboarding video required. Tooltips on first use, not persistent clutter.

### Calendar-First
The calendar is the home screen — not a dashboard with charts and widgets. The primary mental model is "what's going out when."

### Visual at a Glance
Color + icon system communicates send status without reading text. A user scanning the calendar for 5 seconds knows: what's draft, what's approved, what's sent, and where conflicts exist.

### Collaborative by Default
Multi-user real-time editing. No "check out / check in" locking. Changes appear instantly. Activity is logged, not hidden.

### Opinionated but Flexible
EmailCal has a default workflow that works for 90% of teams out of the box. Power users can customize colors, fields, conflict windows, and permissions — but none of that is required to get started.

---

## 9. Information Architecture

```
EmailCal
├── Home (Calendar)
│   ├── Month View (default)
│   ├── Week View
│   └── List / Table View
├── Campaigns
│   ├── All Campaigns
│   └── Campaign Detail (emails + stats)
├── Analytics
│   ├── Performance Dashboard
│   └── Send Fatigue Report
└── Settings
    ├── Team Management (invite, roles)
    ├── Workspace Preferences (conflict window, default colors)
    └── Notifications
```

---

## 10. Technical Requirements

| Requirement | Detail |
|---|---|
| Platform | Web-first, fully responsive. Native mobile in V2. |
| Real-time Collaboration | WebSocket-based live updates (all connected users see changes instantly) |
| Authentication | Email/password + SSO via Google and Microsoft |
| Security & Compliance | SOC 2 Type II compliant. Data encrypted at rest (AES-256) and in transit (TLS 1.3) |
| Uptime SLA | 99.9% monthly uptime |
| Performance | Calendar loads in <2 seconds for up to 500 emails/month |
| Data Retention | 3 years of email history retained by default |
| API | REST API for custom integrations (documented, versioned) |
| Browser Support | Chrome, Firefox, Safari, Edge — last 2 major versions |

---

## 11. Non-Goals (Out of Scope for V1)

These are explicitly not part of EmailCal V1. They may be revisited in future versions.

- **Building or sending emails** — EmailCal is a planning layer, not an ESP. It does not have an email editor or a send engine.
- **Social media scheduling** — Out of scope. EmailCal is email-only.
- **Landing page management** — Not a web content tool.
- **A/B test management** — May be added in V2 via ESP integration.
- **CRM functionality** — Contact management lives in the ESP or CRM.
- **Billing / invoicing** — EmailCal does not handle client billing.

---

## 12. Timeline & Milestones

| Week | Milestone |
|---|---|
| 1–2 | UX research, user interviews, wireframes |
| 3–4 | Design system, hi-fi prototypes, design review |
| 5–6 | Calendar view + email card (P0 core) |
| 7–8 | Campaign grouping, status pipeline, conflict detection |
| 9–10 | Team collaboration (comments, permissions, activity feed) |
| 11–12 | ESP integrations (Mailchimp + Klaviyo first) |
| 13–14 | List view, recurring emails, export |
| 15–16 | Closed beta with 3 pilot marketing teams |
| 17–18 | Beta feedback iteration, performance tuning |
| 19–20 | GA launch |

---

## 13. Open Questions

| # | Question | Owner | Due |
|---|---|---|---|
| 1 | Should EmailCal charge per seat or per workspace? | Product + Finance | Week 2 | 
| 3 | Do we need a formal approval workflow (external stakeholder sign-off) in V1? | Product + Engineering | Week 3 |
| 4 | Should Viewers be able to see all emails or only those assigned to their campaign? | Product | Week 3 | ALl viewers within the organization are able to see. 
| 5 | What is the maximum number of emails per workspace we should design for at launch? | Engineering | Week 5 |

---

*EmailCal PRD v1.0 — For internal use only*
