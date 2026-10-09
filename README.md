# 🏥 Hospital Management System

A full-stack web application designed to simplify hospital operations by managing patients, doctors, appointments, medical records, billing, medicines, prescriptions, and hospital staff through a centralized platform.

## 🚀 Features

- **Dashboard** – View key hospital information in one place.
- **Patient Management** – Manage patient information and records.
- **Doctor Management** – Maintain doctor details.
- **Appointment Management** – Organize and manage appointments.
- **Department Management** – Manage hospital departments.
- **Medical Records** – Maintain patient medical information.
- **Billing Management** – Handle patient billing information.
- **Medicine Management** – Manage medicine details.
- **Prescription Management** – Maintain prescriptions.
- **Staff Management** – Manage hospital staff.
- **Authentication** – Login, registration, and protected routes.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Frontend development server |
| Tailwind CSS | User interface styling |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MySQL | Database |
| XAMPP | Local MySQL database management |
| Git & GitHub | Version control and source code hosting |

## 📂 Project Structure

```text
hospital-management-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── .gitignore
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/)
- [Git](https://git-scm.com/)
- A GitHub account (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/charan111-c/hospital-management-system.git
cd hospital-management-system
```

### 2. Set Up the MySQL Database

1. Open XAMPP Control Panel.
2. Start **Apache** and **MySQL**.
3. Open phpMyAdmin at `http://localhost/phpmyadmin/`.
4. Create a database named `hospital_management`.
5. Import your project's SQL schema or create the required tables.

> Note: Include your database schema or SQL export in the repository if you want other developers to set up the database easily.

### 3. Configure the Backend

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory with the database and application settings required by your backend.

Example template (adjust the variable names to match `backend/config/db.js` and `backend/server.js`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hospital_management
PORT=5000
```

Keep your actual `.env` file private. Do not commit passwords or secrets to GitHub.

Start the backend:

```bash
node server.js
```

### 4. Set Up the Frontend

Open a **second terminal** in the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal, usually:

`http://localhost:5173/`

## 🔐 Security

- Keep database credentials and secret keys in environment variables.
- Never upload your `.env` file to a public repository.
- Use authentication and protected routes to restrict access.
- Use appropriate access controls for sensitive patient information.

## 🔮 Future Enhancements

- Role-based access for administrators, doctors, staff, and patients.
- Online appointment booking and notifications.
- Reports and analytics for hospital operations.
- Improved patient data privacy and audit logging.
- Deployment to a cloud hosting platform.

## 👨‍💻 Author

**Charan Kotha**

GitHub: [@charan111-c](https://github.com/charan111-c)

## 📄 License

This project is available for educational and portfolio purposes. Add a license file if you want to specify formal reuse and distribution permissions.
