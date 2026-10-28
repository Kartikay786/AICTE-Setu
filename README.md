# AICTE Setu

**Team Name:** Six in Sync  
**Problem ID:** SIH26262  
**Problem Statement Title:** Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System

## Overview

AICTE Setu is a unified portal designed to streamline AICTE approval workflows, monitor institutional compliance, and manage alerts throughout the approval lifecycle.

The platform brings institutions, regional officers, EVC committee members, and administrators into one structured workflow. It helps reduce manual follow-ups, improves application visibility, and supports timely action on deficiencies and compliance requirements.

## User Roles

### 1. Institution Administrator
- Create and submit approval applications.
- Upload required documents.
- Track application status and workflow progress.
- View deficiencies raised during scrutiny.
- Update application details and resubmit after corrections.

### 2. Regional Officer
- Review applications submitted by institutions.
- Examine application details and document validation findings.
- Raise deficiencies with clear remarks.
- Review corrected submissions.
- Forward eligible applications to the next workflow stage.

### 3. EVC Committee Member
- View applications assigned for committee review or inspection.
- Review application information and scrutiny remarks.
- Record inspection observations.
- Submit recommendations for further action.

### 4. Super Admin
- Oversee applications and workflow activity across the portal.
- Manage user roles and access.
- Monitor pending cases, application progress, and compliance status.
- View overall system activity and workflow summaries.

## Key Features

- **Role-based dashboards:** Each role gets a focused workspace and relevant actions.
- **Approval workflow management:** Track applications through submission, scrutiny, deficiency resolution, and committee review.
- **Document validation:** Identify missing or expired documents and highlight potential mismatches for review.
- **Deficiency management:** Communicate issues and allow institutions to correct and resubmit applications.
- **Compliance monitoring:** View compliance status and outstanding actions.
- **Alerts and notifications:** Surface important updates, pending tasks, and workflow actions.
- **Application tracking:** Maintain visibility into application status and review history.
- **Responsive interface:** Access the portal through desktop and mobile-sized screens.

## Workflow

1. Institution Administrator prepares and submits an application with the required documents.
2. The application is reviewed by the Regional Officer.
3. If deficiencies are found, the Regional Officer returns the application with remarks.
4. The Institution Administrator addresses the deficiencies and resubmits the application.
5. The Regional Officer reviews the corrected submission and forwards eligible cases.
6. The EVC Committee Member records inspection observations and a recommendation.
7. The Super Admin monitors the overall workflow and application progress.

## Technology Stack

- **Frontend:** React
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Icons:** Lucide React
- **Charts and visualizations:** Recharts

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## Project Structure

```text
src/
├── components/       # Shared UI components
├── pages/            # Application pages and dashboards
├── routes/           # Route definitions and access handling
├── data/             # Application and user data structures
├── context/          # Shared application state
└── App.jsx           # Main application entry
```

*The structure may vary depending on the implementation.*

## Project Objective

AICTE Setu aims to make the approval and compliance process more transparent, organized, and efficient by providing a common platform for application submission, scrutiny, deficiency resolution, inspection recommendations, and workflow monitoring.

## Team

**Six in Sync**

## Problem Statement

- **Problem ID:** SIH26262
- **Title:** Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System
