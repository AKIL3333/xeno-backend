# Multi-Tenant Shopify Data Ingestion & Insights Service

This repository contains the backend service built for the Xeno FDE Internship Assignment – 2025.  
It provides a multi-tenant integration with Shopify, allowing retailers to connect their stores, ingest customer/order/product data, and expose dashboard APIs for insights.  
### Frontend website link:https://xeno-frontend-omega.vercel.app/

## Features

### Authentication & Multi-Tenancy
- Tenant signup & login with email/password  
- JWT-based authentication  
- Middleware for tenant isolation using `x-tenant-id`  

### Shopify App Integration
- OAuth-based installation flow for Shopify stores  
- Data sync for customers, orders, and products via Shopify Admin APIs  
- Optional webhook support for real-time events  

### Data Ingestion
- Background poller to fetch new data periodically  
- Data persisted in PostgreSQL using Prisma ORM  

### Dashboard API Endpoints
- /dashboard/summary – Key business metrics  
- /dashboard/orders-by-date – Order volume trends  
- /dashboard/top-customers – Highest spending customers  
- /dashboard/new-customers-by-date – Acquisition over time  
- /dashboard/avg-order-value-by-date – Average order value trends  

## Tech Stack

- Backend Framework: Node.js + Express  
- Database: PostgreSQL  
- ORM: Prisma  
- Authentication: JWT + bcrypt  
- Shopify Integration: Shopify Admin APIs, Webhooks  
- Deployment Ready: Render 

## Project Structure

```
XENO_BACKEND
├── prisma/           # Prisma schema & migrations
├── src/
│   ├── controllers/  # Auth, Shopify, Dashboard controllers
│   ├── jobs/         # Background poller for ingestion
│   ├── middleware/   # Tenant isolation middleware
│   ├── routes/       # API routes
│   ├── utils/        # Shopify API helper
│   ├── app.js        # Express app setup
│   └── server.js     # Entry point
├── .env              # Environment variables (not committed)
├── .gitignore        # Ignored files (node_modules, .env)
├── package.json
└── README.md
```
## Architecture Diagram:
1. Architecture Diagram
flowchart TD
    subgraph User["👤 User"]
        A1[React Frontend<br>(Vercel)]
    end

    subgraph Backend["🖥️ Node.js Express Backend<br>(Render/Vercel Serverless)"]
        B1[/Auth Routes/]
        B2[/Shopify Install + Callback/]
        B3[/Dashboard API/]
        B4[/Poller Cron Job/]
    end

    subgraph Shopify["🛍️ Shopify Store"]
        S1[(Customers)]
        S2[(Products)]
        S3[(Orders)]
    end

    subgraph DB["🗄️ PostgreSQL + Prisma ORM"]
        D1[(Tenant)]
        D2[(Customer)]
        D3[(Product)]
        D4[(Order)]
        D5[(Event)]
    end

    %% Connections
    A1 -->|REST API Calls| Backend
    Backend -->|OAuth Install + Webhooks| Shopify
    Shopify -->|Access Token + Data| Backend
    Backend -->|Persist Entities| DB
    DB -->|Query Data| Backend
    Backend -->|Insights + Charts| A1
## Setup & Installation

1. Clone the repository  

   git clone https://github.com/<your-username>/xeno_backend.git
   cd xeno_backend
 

2. Install dependencies  

   npm install


3. Configure environment variables  
   Create a `.env` file in the root directory:  

   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>  
   SHOPIFY_API_KEY=your_api_key  
   SHOPIFY_API_SECRET=your_api_secret  
   SHOPIFY_SCOPES=read_customers,read_orders,read_products  
   APP_URL=https://your-app-url.com  
   JWT_SECRET=your_secret  


4. Apply Prisma migrations  

   npx prisma migrate deploy


5. Start the server  

   npm start


## Shopify App Installation

To install the app on a Shopify store, open in your browser:  
(but do not forget to permit your app on the store)
```
https://<APP_URL>/api/shopify/install?shop=<store-name>.myshopify.com
```

## API Endpoints

All endpoints require a JWT in the `Authorization` header and the `x-tenant-id` header.  

- GET /dashboard/summary  
- GET /dashboard/orders-by-date  
- GET /dashboard/top-customers  
- GET /dashboard/new-customers-by-date  
- GET /dashboard/avg-order-value-by-date  

## Current Status  

- Shopify store setup with dummy data  
- Backend service with multi-tenant ingestion  
- Secure authentication & tenant isolation  
- Dashboard APIs functional  
- Deployed
- Used polling(Scheduler) to fetch and upsert Shopify data into my database.
## Known Limitations and Assumptions.
- Since I carried out the development without a fixed server (in local machine) it was not feasible for me to use real time webhooks from shopify,therefore I used a poller system which ingests data from shopify every single minute accurately.
- Since this is a testing phase,I have just tested the shopify stores on my app which provides me a temporary access token(which works well for most cases) only,requiring to manually update the permanent admin api token in the database.
- 

## Author  

Built by Akil S  
Vellore Institute of Technology, Chennai
akil031204@gmail.com
