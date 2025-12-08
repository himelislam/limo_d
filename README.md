# LimoD - Luxury Chauffeur Service Platform

A comprehensive platform for managing luxury chauffeur services, including booking management, driver allocation, and trip tracking.

## 🚀 Features

### User Management
- User registration and authentication
- Role-based access control
- Profile management

### Booking System
- Real-time booking management
- Booking status tracking
- Booking history

### Business Management
- Business profile management
- Fleet management
- Driver assignment

### Trip Management
- Real-time trip tracking
- Trip history
- Route optimization

### Driver Management
- Driver profiles
- Availability management
- Performance tracking

### Vehicle Management
- Fleet management
- Vehicle tracking
- Maintenance scheduling

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- React Query
- Formik & Yup for form handling
- Radix UI components

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Nodemailer for email notifications

## 📦 Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB (local or cloud instance)

## 🚀 Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a [.env](cci:7://file:///Users/dorikair/Downloads/limo_d/backend/.env:0:0-0:0) file based on [.env.example](cci:7://file:///Users/dorikair/Downloads/limo_d/backend/.env.example:0:0-0:0) and update the environment variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🌟 Available Scripts

### Backend
- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm test` - Run tests (to be implemented)

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📂 Project Structure

```
limo_d/
├── backend/                # Backend server
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Custom middlewares
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
│
└── frontend/              # Frontend React application
    ├── public/            # Static files
    └── src/               # Source files
        ├── components/    # Reusable components
        ├── pages/         # Page components
        ├── hooks/         # Custom hooks
        ├── lib/           # Utility functions
        └── App.jsx        # Main application component
```

## 🔒 Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token generation
- `NODE_ENV` - Application environment (development/production)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js

