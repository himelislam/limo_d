# **Transport Fleet & Driver Management System API**  

🚗 **A RESTful API for managing vehicles, drivers, passengers, and trips with role-based authentication**  

---

## **Table of Contents**  
1. [Features](#features)  
2. [Technologies](#technologies)  
3. [Installation](#installation)  
4. [API Endpoints](#api-endpoints)  
5. [Authentication](#authentication)  
6. [Role-Based Access](#role-based-access)  
7. [Sample Requests](#sample-requests)  
8. [Environment Variables](#environment-variables)  
9. [License](#license)  

---

## **✨ Features**  
✔ **User Authentication** (Register, Login, Logout)  
✔ **Role-Based Access Control** (Admin, Owner, Driver, Passenger)  
✔ **Fleet Management** (Add, Update, Delete Vehicles)  
✔ **Driver & Passenger Management**  
✔ **Trip Logging & Assignment**  
✔ **JWT Token Security**  

---

## **🛠 Technologies**  
- **Backend**: Node.js, Express  
- **Database**: MongoDB (Mongoose)  
- **Authentication**: JWT (JSON Web Tokens)  
- **Password Hashing**: BcryptJS  
- **Error Handling**: Custom middleware  

---

## **⚙ Installation**  

### **1. Clone the repository**  
```bash
git clone https://github.com/yourusername/fleet-management-api.git
cd fleet-management-api
```

### **2. Install dependencies**  
```bash
npm install
```

### **3. Set up environment variables**  
Create a `.env` file:  
```env
MONGODB_URI=mongodb://localhost:27017/fleet-management
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=30d
PORT=5000
```

### **4. Run the server**  
```bash
npm run dev  # Development (with nodemon)
npm start    # Production
```

---

## **🔌 API Endpoints**  

### **🔐 Authentication**  
| **Endpoint** | **Method** | **Description** | **Access** |
|-------------|-----------|----------------|------------|
| `/api/auth/register` | POST | Register a new user | Public |
| `/api/auth/login` | POST | Login user | Public |
| `/api/auth/logout` | GET | Logout user (clear token) | Private |
| `/api/auth/me` | GET | Get current user profile | Private |

### **🚗 Vehicles**  
| **Endpoint** | **Method** | **Description** | **Access** |
|-------------|-----------|----------------|------------|
| `/api/vehicles` | GET | Get all vehicles | Admin, Owner |
| `/api/vehicles` | POST | Add a new vehicle | Admin, Owner |
| `/api/vehicles/:id` | GET | Get a single vehicle | Admin, Owner, Driver |
| `/api/vehicles/:id` | PUT | Update a vehicle | Admin, Owner |
| `/api/vehicles/:id` | DELETE | Delete a vehicle | Admin |

### **👨‍✈️ Drivers**  
| **Endpoint** | **Method** | **Description** | **Access** |
|-------------|-----------|----------------|------------|
| `/api/drivers` | GET | Get all drivers | Admin, Owner |
| `/api/drivers` | POST | Add a new driver | Admin, Owner |
| `/api/drivers/:id` | GET | Get a single driver | Admin, Owner, Driver |
| `/api/drivers/:id` | PUT | Update a driver | Admin, Owner |
| `/api/drivers/:id` | DELETE | Delete a driver | Admin |

### **👥 Passengers**  
| **Endpoint** | **Method** | **Description** | **Access** |
|-------------|-----------|----------------|------------|
| `/api/passengers` | GET | Get all passengers | Admin, Owner |
| `/api/passengers` | POST | Add a new passenger | Public |
| `/api/passengers/:id` | GET | Get a single passenger | Admin, Owner, Passenger |
| `/api/passengers/:id` | PUT | Update a passenger | Admin, Owner, Passenger |
| `/api/passengers/:id` | DELETE | Delete a passenger | Admin |

### **✈️ Trips**  
| **Endpoint** | **Method** | **Description** | **Access** |
|-------------|-----------|----------------|------------|
| `/api/trips` | GET | Get all trips | Admin, Owner |
| `/api/trips` | POST | Create a new trip | Admin, Owner |
| `/api/trips/:id` | GET | Get a single trip | Admin, Owner, Driver, Passenger |
| `/api/trips/:id/status` | PUT | Update trip status | Admin, Owner, Driver |
| `/api/trips/driver/:driverId` | GET | Get trips by driver | Admin, Owner, Driver |

---

## **🔒 Authentication**  
- **JWT Tokens** are used for authentication.  
- Include token in headers:  
  ```http
  Authorization: Bearer <your_token>
  ```

---

## **👮 Role-Based Access**  
| **Role** | **Permissions** |
|----------|----------------|
| **Admin** | Full access (manage all data) |
| **Owner** | Manage vehicles, drivers, trips |
| **Driver** | View assigned trips, update status |
| **Passenger** | View own trips, update profile |

---

## **📝 Sample Requests**  

### **1. Register a User**  
**POST `/api/auth/register`**  
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+919876543210",
  "role": "driver"
}
```

### **2. Login**  
**POST `/api/auth/login`**  
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### **3. Create a Trip (Admin/Owner Only)**  
**POST `/api/trips`**  
```json
{
  "vehicle": "75b2c3d4e5f6g7h8i9001a",
  "driver": "65a1b2c3d4e5f6g7h8i9001",
  "origin": "Delhi",
  "destination": "Mumbai",
  "distance": 1200,
  "fare": 5000,
  "passengers": ["85c3d4e5f6g7h8i9001x"]
}
```

---

## **🌍 Environment Variables**  
| **Variable** | **Description** |
|-------------|----------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT |
| `JWT_EXPIRES_IN` | Token expiry (e.g., `30d`) |
| `PORT` | Server port (default: `5000`) |

---

## **📜 License**  
MIT License © 2025 Himel Islam  

---