# High-Level Design (HLD)

## ScholarHub LMS

ScholarHub is a full-stack Learning Management System for **Students, Instructors, and Admins**.

### Tech Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Frontend       | React, Vite, React Router |
| Backend        | Node.js, Express          |
| Database       | MongoDB, Mongoose         |
| Authentication | JWT, bcryptjs, OTP        |
| Payments       | Razorpay                  |
| File Storage   | Cloudinary                |
| Email          | Nodemailer                |

## Architecture

```text
                ┌──────────────────┐
                │   React Client   │
                │ Student/Teacher  │
                │      /Admin      │
                └────────┬─────────┘
                         │ HTTP/JSON
                         ▼
                ┌──────────────────┐
                │  Express Server  │
                │ Routes           │
                │ Controllers      │
                │ Middleware       │
                └────────┬─────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     ┌─────────┐   ┌───────────┐  ┌──────────┐
     │ MongoDB │   │ Cloudinary│  │ Razorpay │
     │         │   │  Storage  │  │ Payments │
     └─────────┘   └───────────┘  └──────────┘
```

## Main Components

### Frontend

Handles:

* Authentication
* Course browsing
* Course learning
* Instructor course management
* Quizzes
* Progress tracking
* Payments
* Admin dashboard

### Backend

```text
server/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── utils/
└── server.js
```

### Database Models

* `User`
* `Course`
* `Category`
* `Level`
* `Module`
* `Topic`
* `Quiz`
* `Submission`
* `Progress`
* `Payment`

## Authentication

```text
Register
   ↓
OTP Verification
   ↓
Login
   ↓
JWT
   ↓
Protected API
   ↓
Role Authorization
```

Roles:

* Student
* Instructor
* Admin

## Main Workflows

### Course Creation

```text
Instructor
    ↓
Create Course
    ↓
Add Modules
    ↓
Add Topics
    ↓
Admin Review
   ↙      ↘
Reject    Approve
  ↓          ↓
Edit      Published
```

### Payment

```text
Student
   ↓
Select Course
   ↓
Razorpay
   ↓
Server Verification
   ↓
Payment Record
   ↓
Course Access
```

### Learning Progress

```text
Student
   ↓
Open Topic
   ↓
Complete Topic
   ↓
Progress API
   ↓
MongoDB
   ↓
Updated Progress
```

## Security

* Passwords are hashed using `bcryptjs`.
* JWT protects authenticated routes.
* Role-based authorization restricts access.
* OTP is used for account verification.
* Secrets are stored using environment variables.
* Payments are verified on the server.
* Uploaded files are validated.

## Deployment

```text
React Frontend
      ↓
Express API
      ↓
 ┌────┼──────────┬─────────┐
 ↓    ↓          ↓         ↓
MongoDB Cloudinary Razorpay SMTP
```

## Future Scalability

* Database indexing
* Pagination
* Redis caching
* CDN-based media delivery
* Background workers
* Horizontal API scaling
