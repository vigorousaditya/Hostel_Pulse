
# HostelPulse 🏨

HostelPulse is a hostel issue management platform designed to streamline communication between hostel residents and administrators. The system allows students to report hostel-related issues easily, while administrators can manage and resolve complaints efficiently.

The platform ensures better transparency, faster resolution of problems, and improved hostel management.

---

## 📌 Project Overview

In many hostels, students face problems such as maintenance issues, electricity failures, water supply problems, or sanitation issues. These complaints are often reported informally which leads to delays and poor tracking.

HostelPulse solves this problem by providing a centralized digital platform where:

- Students can submit complaints online
- Complaints can be categorized and tracked
- Administrators can monitor and resolve issues
- Users can track the status of their complaints

This system improves communication and accountability between students and hostel authorities.

---

## ✨ Features

### Student Features
- User registration and login
- Submit hostel complaints
- Categorize complaints (electricity, water, maintenance, etc.)
- Track complaint status
- View previously submitted complaints

### Admin Features
- View all complaints submitted by students
- Filter complaints by category or status
- Update complaint status (Pending / In Progress / Resolved)
- Manage hostel issues efficiently

### Authentication
- Secure user authentication
- Email verification system
- Role-based access control

---

## 🛠 Tech Stack

### Frontend
- React.js
- TailwindCSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Tools
- Git
- GitHub

### Deployment
- AWS EC2 for backend
- AWS S3 for frontend


---

## 🚀 Future Improvements

- Push notifications for updates
- Admin analytics dashboard
- Complaint priority system
- Mobile responsive improvements

## 🚀 How to Run the Project

### 🌐 Live Demo

The project is already deployed and accessible here:

👉 


### 💻 Run Locally

Follow these steps to set up and run the project on your local machine.

#### Prerequisites
- Node.js (v18 or above)
- MongoDB (local installation or MongoDB Atlas)
- Git
#### 1. Clone the Repository

```bash
git clone https://github.com/ietlucknowofficial/HostelPulse
cd hostelPulse
```

#### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

Start the backend server:

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

The backend will run at `http://localhost:5000`

#### 3. Setup the Frontend

Open a new terminal window:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

#### 4. Open in Browser

Visit: `http://localhost:3000`

---

> **Note:** Make sure MongoDB is running locally, or replace `MONGO_URI` with your MongoDB Atlas connection string.

---


## 👥 Contributors







