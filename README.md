# ScholarHub - Advanced Learning Management System (LMS)

ScholarHub is a modern, full-stack Learning Management System designed to provide a premium experience for students, instructors, and administrators. It features a robust architecture with a secure backend, real-time progress tracking, and an interactive learning interface.

## 🚀 Key Features

### 👨‍🎓 For Students
- **Interactive Course Player**: Seamlessly switch between video lessons, topics, and modules.
- **Knowledge Checks**: Real-time quizzes at the end of topics to validate learning.
- **Progress Tracking**: Visual progress bars and lesson completion markers.
- **Secure Payments**: Integrated Razorpay for course purchases.
- **Wishlist & History**: Save courses for later and track your purchase history.

### 👨‍🏫 For Instructors
- **Course Studio**: Create and manage complex courses with modules and topics.
- **Revenue Analytics**: Track earnings per course with duration-based filters (7d, 30d, 1y).
- **Dynamic Content**: Support for both YouTube embeds and direct video uploads.

### 🛡️ For Admins
- **User Management**: Monitor, suspend, or promote users across the platform.
- **Course Quality Control**: Review and approve courses before they go live.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), React Router, Lucide/Feather Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JWT (JSON Web Tokens) with OTP-based email verification.
- **Payments**: Razorpay Integration.
- **Media**: Cloudinary for secure file/video storage.

---

## ⚙️ Project Setup

### 1. Prerequisites
- Node.js installed on your machine.
- MongoDB Atlas account or local MongoDB instance.
- Cloudinary, Razorpay, and Gmail accounts (for SMTP).

### 2. Clone the Repository
```bash
git clone <repository-url>
cd lms
```

### 3. Server Setup
```bash
cd server
npm install
```
- Create a `.env` file in the `server` directory (use `.env.example` as a template).
- Populate the variables: `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `EMAIL_USER`, `CLOUDINARY_CLOUD_NAME`, etc.

### 4. Client Setup
```bash
cd ../client
npm install
```
- Create a `.env` file in the `client` directory.
- Set `VITE_API_URL=http://localhost:5000`.

### 5. Running the Project
**Start the Server:**
```bash
cd server
npm run dev
```

**Start the Client:**
```bash
cd client
npm run dev
```

---

## 🧪 Credentials for Testing (Optional)
If you are setting up for the first time, you can create users with the following roles by manually updating the `role` field in your MongoDB `users` collection:
- `student` (Default)
- `instructor`
- `admin`

---

## 📝 License
This project is for educational and professional demonstration purposes.

*Built with ❤️ by the ScholarHub Team*
