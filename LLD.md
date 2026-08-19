# Low-Level Design (LLD)

## ScholarHub LMS

## Backend Structure

```text
server/
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── configController.js
│   ├── courseController.js
│   ├── paymentController.js
│   ├── quizController.js
│   ├── signup.controller.js
│   └── uploadController.js
├── middlewares/
│   └── auth.js
├── models/
├── routes/
├── utils/
└── server.js
```

## Models

| Model        | Responsibility                   |
| ------------ | -------------------------------- |
| `User`       | Authentication and roles         |
| `Course`     | Course information and ownership |
| `Category`   | Course classification            |
| `Level`      | Course difficulty                |
| `Module`     | Course sections                  |
| `Topic`      | Individual learning units        |
| `Quiz`       | Assessments                      |
| `Submission` | Quiz attempts/results            |
| `Progress`   | Student learning progress        |
| `Payment`    | Purchase records                 |

## Relationships

```text
User
 ├── Courses
 ├── Progress
 ├── Payments
 └── Submissions

Course
 ├── Category
 ├── Level
 ├── Modules
 ├── Progress
 └── Payments

Module
 └── Topics

Topic
 └── Quiz

Quiz
 └── Submissions
```

## Controllers

| Controller          | Responsibility            |
| ------------------- | ------------------------- |
| `authController`    | Login/authentication      |
| `signup.controller` | Registration and OTP      |
| `courseController`  | Course management         |
| `quizController`    | Quiz operations           |
| `paymentController` | Razorpay/payment handling |
| `uploadController`  | File uploads              |
| `adminController`   | Admin operations          |
| `configController`  | Configuration             |

## API Routes

```text
/auth
/signup
/course
/quiz
/payment
/upload
/admin
/config
```

## Authentication Flow

```text
Request
   ↓
JWT
   ↓
Verify Token
   ↓
Identify User
   ↓
Check Role
   ↓
Controller
```

| Condition                | Response            |
| ------------------------ | ------------------- |
| Invalid token            | `401 Unauthorized`  |
| Insufficient permissions | `403 Forbidden`     |
| Valid request            | Controller executes |

## Course Structure

```text
Course
├── Module 1
│   ├── Topic 1
│   └── Topic 2
├── Module 2
│   ├── Topic 1
│   └── Topic 2
└── Module 3
```

## Quiz Flow

```text
Student
   ↓
Quiz API
   ↓
Validate Submission
   ↓
Calculate Score
   ↓
Save Submission
   ↓
Return Result
```

## Payment Flow

```text
Student
   ↓
Payment Request
   ↓
Razorpay
   ↓
Server Verification
   ↓
Save Payment
   ↓
Grant Course Access
```

> Payment must be verified by the server before course access is granted.

## File Upload Flow

```text
Instructor
   ↓
Multipart Request
   ↓
Multer
   ↓
Upload Controller
   ↓
Cloudinary
   ↓
Media URL
```

## Validation

* Unique and valid email
* OTP verification
* Hashed passwords
* Course ownership checks
* Role authorization
* Authenticated quiz submissions
* Server-side payment verification
* File type/size validation

## HTTP Status Codes

|  Code | Meaning      |
| ----: | ------------ |
| `200` | Success      |
| `201` | Created      |
| `400` | Bad Request  |
| `401` | Unauthorized |
| `403` | Forbidden    |
| `404` | Not Found    |
| `409` | Conflict     |
| `500` | Server Error |
