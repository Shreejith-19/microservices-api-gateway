# Microservices API Gateway Platform

A modular, production-inspired microservices backend built with Node.js, Express, MongoDB, Redis, gRPC, and Docker Compose.

---

## 🏗 System Architecture

```text
Client / Postman
      │
      │ HTTP / REST
      ▼
┌───────────────────────────────────────┐
│              API Gateway              │
│   (Port 8080 - Redis Rate Limiting)   │
└──────────────────┬────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐
│ Auth Service │ │ User Service │ │ Notification Service │
│ (Port 5001)  │ │ (Port 5002)  │ │     (Port 5003)      │
└──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘
       │                │                    │
       ▼                ▼                    ▼
┌────────────────────────────────────────────────────────┐
│                        MongoDB                         │
│                      (Port 27017)                      │
└────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

- **Runtime & Framework:** Node.js, Express.js
- **Databases & Cache:** MongoDB, Redis
- **Inter-Service Communication:** gRPC (`@grpc/grpc-js`, `@grpc/proto-loader`)
- **Authentication:** JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`)
- **Containerization & Orchestration:** Docker, Docker Compose

---

## 📂 Project Structure

```text
microservices-api-gateway/
├── gateway/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── auth-service/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── user-service/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── notification-service/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── proto/
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Services Overview

| Service | Port (HTTP / gRPC) | Responsibility | Database |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `8080` / N/A | Single entry point, routing, Redis rate limiting, JWT validation | Redis (`6379`) |
| **Auth Service** | `5001` / `50051` | User registration, login, credential validation, JWT issuance | MongoDB (`auth_db`) |
| **User Service** | `5002` / `50052` | User profile retrieval and management | MongoDB (`user_db`) |
| **Notification Service** | `5003` / `50053` | Email/SMS/In-app notification dispatching | MongoDB (`notification_db`) |

---

## 💻 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [Docker & Docker Compose](https://www.docker.com/)

### 2. Running with Docker Compose
To build and start all microservices, MongoDB, and Redis in the background:
```bash
docker-compose up --build -d
```

### 3. Running Services Locally
Install dependencies and run each service independently:
```bash
# Gateway
cd gateway && npm install && npm run dev

# Auth Service
cd auth-service && npm install && npm run dev

# User Service
cd user-service && npm install && npm run dev

# Notification Service
cd notification-service && npm install && npm run dev
```