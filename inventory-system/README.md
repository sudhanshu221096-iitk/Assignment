# InvenTrack — Inventory & Order Management System

A production-ready, fully containerized full-stack application built with **FastAPI**, **React**, and **PostgreSQL**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 + FastAPI |
| Frontend | React 18 (JavaScript) |
| Database | PostgreSQL 15 |
| Containerization | Docker + Docker Compose |
| Backend Deploy | Render / Railway / Fly.io |
| Frontend Deploy | Vercel / Netlify |

## Features

- **Product Management** — CRUD with SKU uniqueness, stock tracking, low-stock alerts
- **Customer Management** — Create/list/delete customers with unique email enforcement
- **Order Management** — Create orders with automatic stock deduction, insufficient-stock validation, order cancellation restores stock
- **Dashboard** — Summary stats + low stock alerts
- **Business Logic** — Total amount auto-calculated, all inputs validated, proper HTTP status codes

## Quick Start (Docker Compose)

```bash
# Clone the repo
git clone <your-repo-url>
cd inventory-system

# Start all services
docker-compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /products/ | Create product |
| GET | /products/ | List all products |
| GET | /products/{id} | Get product by ID |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /customers/ | Create customer |
| GET | /customers/ | List all customers |
| GET | /customers/{id} | Get customer by ID |
| DELETE | /customers/{id} | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /orders/ | Create order |
| GET | /orders/ | List all orders |
| GET | /orders/{id} | Get order details |
| DELETE | /orders/{id} | Cancel/delete order |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard/ | Get summary stats |

## Environment Variables

### Backend
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Frontend
```
REACT_APP_API_URL=https://your-backend-url.com
```

## Deployment

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add env var: `DATABASE_URL` (from Render PostgreSQL)

### Backend (Railway)
1. Connect GitHub repo on [railway.app](https://railway.app)
2. Add PostgreSQL plugin
3. Set `DATABASE_URL` from plugin
4. Railway auto-detects the Dockerfile

### Frontend (Vercel)
1. Import repo on [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `build`
5. Add env var: `REACT_APP_API_URL=<your-backend-url>`

### Frontend (Netlify)
1. Import repo on [netlify.com](https://netlify.com)
2. Base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `frontend/build`
5. Add env var: `REACT_APP_API_URL=<your-backend-url>`

## Docker Hub

```bash
# Build and push backend image
docker build -t yourusername/inventory-backend:latest ./backend
docker push yourusername/inventory-backend:latest
```

## Submission Deliverables

- **GitHub Repository**: `https://github.com/<username>/inventory-system`
- **Docker Hub Image**: `https://hub.docker.com/r/<username>/inventory-backend`
- **Live Frontend URL**: `https://<your-app>.vercel.app`
- **Live Backend API URL**: `https://<your-api>.onrender.com`
