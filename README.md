# Finance Manager

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
</div>

<br>

<div align="center">
  <img src="https://raw.githubusercontent.com/MrAkshay143/finance-manager/main/public/logo.png" alt="Finance Manager Logo" width="100" height="100">
</div>

<br>

A modern, responsive personal finance management application built with Next.js, Tailwind CSS, and PHP/MySQL backend.

## 📸 Screenshots

<div align="center">
  <img src="https://raw.githubusercontent.com/MrAkshay143/finance-manager/main/screenshots/dashboard.png" alt="Dashboard" width="300">
  <img src="https://raw.githubusercontent.com/MrAkshay143/finance-manager/main/screenshots/transactions.png" alt="Transactions" width="300">
  <img src="https://raw.githubusercontent.com/MrAkshay143/finance-manager/main/screenshots/reports.png" alt="Reports" width="300">
</div>

## ✨ Features

- **User Authentication & Authorization**

  - Secure login and registration
  - Password reset functionality
  - User roles and permissions

- **Financial Management**

  - Track income and expenses
  - Create and manage ledger accounts
  - Record transactions with multiple types (Receipt, Payment, Transfer, Journal)
  - Categorize transactions

- **Reporting & Analysis**

  - Income vs Expense reports
  - Monthly summary charts
  - Net worth tracking
  - Expense analysis by category

- **Mobile-Friendly Design**

  - Responsive UI that works on all devices
  - Native app-like experience on mobile
  - Bottom navigation for easy access

- **Modern UI/UX**
  - Dark mode support
  - Smooth animations
  - Toast notifications
  - Form validation

## 🔧 Tech Stack

### Frontend

- **Next.js** - React framework for SSR and static site generation
- **Tailwind CSS** - Utility-first CSS framework
- **FontAwesome** - Icon library
- **Chart.js** - Responsive and interactive charts

### Backend

- **PHP 8.0+** - Server-side scripting
- **MySQL** - Database management
- **RESTful API** - For communication between frontend and backend

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- PHP (v8.0+)
- MySQL (v5.7+)
- Composer

### Installation

#### Option 1: Manual Installation

1. Clone the repository

   ```bash
   git clone https://github.com/MrAkshay143/finance-manager.git
   cd finance-manager
   ```

2. Install dependencies

   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   composer install
   ```

3. Set up environment variables

   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env.local

   # Backend
   cp backend/.env.example backend/.env
   ```

4. Configure your database settings in `backend/.env`

5. Run database migrations

   ```bash
   cd backend
   php artisan migrate
   php artisan db:seed
   ```

6. Start the development servers

   ```bash
   # Start frontend
   cd frontend
   npm run dev

   # Start backend (in a separate terminal)
   cd backend
   php -S localhost:8000 -t public
   ```

#### Option 2: Using the Setup Wizard

1. Upload the entire project to your web server

2. Access the setup page in your browser: `https://yourdomain.com/setup`

3. Follow the step-by-step instructions to:
   - Check system requirements
   - Configure your database
   - Create an admin account

## 📦 Deployment

### Hostinger Deployment

1. Upload the entire project to your Hostinger cPanel or via FTP to the `public_html` directory

2. Create a MySQL database and user through Hostinger cPanel

3. Access your domain (e.g., `erp.imakshay.in`) and follow the setup wizard

4. Complete the installation process

## 🔐 Security Features

- Password hashing using bcrypt
- CSRF protection
- Input validation
- Prepared SQL statements
- XSS protection
- API authentication with tokens

## 📚 Documentation

Detailed documentation is available in the [docs](./docs) directory:

- [User Guide](./docs/user-guide.md)
- [API Documentation](./docs/api.md)
- [Development Guide](./docs/development.md)

## 🤝 Contributing

Contributions are always welcome! Please read the [contribution guidelines](CONTRIBUTING.md) first.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Akshay Mondal**

- GitHub: [@MrAkshay143](https://github.com/MrAkshay143)
- Instagram: [@mr.akshay_mondal](https://instagram.com/mr.akshay_mondal)
- Website: [imakshay.in](https://imakshay.in)

## 💖 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [FontAwesome](https://fontawesome.com/)
- [Chart.js](https://www.chartjs.org/)
- [All Contributors](../../contributors)
