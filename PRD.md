# Product Requirements Document (PRD)

## ScholarHub LMS

## Product Overview

ScholarHub is an LMS that allows students to **discover, purchase, and learn from courses**, while instructors create courses and admins manage the platform.

## Problem

Students often need multiple platforms for:

* Course discovery
* Payments
* Learning
* Assessments
* Progress tracking

ScholarHub combines these into one platform.

## Target Users

### Student

* Browse courses
* Purchase courses
* Learn from topics
* Take quizzes
* Track progress
* Manage wishlist/history

### Instructor

* Create courses
* Add modules and topics
* Upload content
* Manage courses
* View course information

### Admin

* Manage users
* Review courses
* Approve/reject courses
* Manage platform access

## Core Features

### Authentication

* Registration
* OTP verification
* Login
* JWT authentication
* Role-based authorization

### Course Management

* Course creation/editing
* Categories and levels
* Modules
* Topics
* Course approval

### Learning

* Course player
* Topic navigation
* Progress tracking
* Quizzes
* Quiz submissions/results

### Payments

* Razorpay integration
* Payment verification
* Purchase records
* Course access

### Media

* File/video uploads
* Cloudinary storage

### Administration

* User management
* Course moderation
* Course approval/rejection

## User Stories

### Student

* As a student, I want to browse courses so I can find something to learn.
* As a student, I want to purchase a course securely.
* As a student, I want to track my learning progress.
* As a student, I want to take quizzes and see my results.

### Instructor

* As an instructor, I want to create courses.
* As an instructor, I want to organize content into modules and topics.
* As an instructor, I want to upload learning material.

### Admin

* As an admin, I want to manage users.
* As an admin, I want to approve or reject courses.

## Functional Requirements

| ID   | Requirement                                 |
| ---- | ------------------------------------------- |
| FR01 | Users can register and verify their account |
| FR02 | Users can securely log in                   |
| FR03 | Roles control feature access                |
| FR04 | Students can browse courses                 |
| FR05 | Instructors can create/manage courses       |
| FR06 | Courses contain modules and topics          |
| FR07 | Students can access purchased courses       |
| FR08 | Students can take quizzes                   |
| FR09 | Student progress is stored                  |
| FR10 | Courses can be purchased using Razorpay     |
| FR11 | Instructors can upload media                |
| FR12 | Admins can manage users/courses             |

## Course Approval

```text
Draft
  ↓
Submitted
  ↓
Admin Review
 ├── Reject → Edit → Resubmit
 └── Approve → Published
```

## Non-Functional Requirements

### Security

* Hash passwords
* Protect APIs using JWT
* Enforce role permissions
* Verify payments server-side
* Protect environment secrets
* Validate uploads

### Performance

* Pagination for large datasets
* Database indexing
* CDN-based media

### Maintainability

* Separate routes/controllers/models
* Reusable frontend components
* Environment-based configuration

## MVP Scope

### Included

* Authentication
* OTP verification
* Role management
* Course catalog
* Course creation
* Modules/topics
* Quizzes
* Progress tracking
* Payments
* Media uploads
* Admin approval

### Future

* Certificates
* Reviews and ratings
* Notifications
* AI learning assistant
* Course recommendations
* Live classes
* Mobile application

## Acceptance Criteria

* Users can register, verify, and log in.
* Protected APIs reject unauthorized users.
* Instructors can manage their own courses.
* Courses support modules and topics.
* Admins can approve/reject courses.
* Students can purchase courses.
* Payments are verified before access.
* Students can submit quizzes and receive results.
* Learning progress is stored.

## Main Product Flow

```text
Register
   ↓
Verify
   ↓
Login
   ↓
Browse Course
   ↓
Purchase
   ↓
Learn
   ↓
Take Quiz
   ↓
Track Progress
```

## Success Metrics

* Course purchase rate
* Course completion rate
* Quiz participation
* Instructor course creation
* Payment failure rate
* Upload failure rate
* Student engagement
