# Xeno Backend – Multi-Tenant Shopify Data Ingestion & Insights Service

This project is built as part of the **Xeno FDE Internship Assignment – 2025**.  
It implements a **multi-tenant backend service** that connects with Shopify stores, ingests customer/order/product data, and provides insightful dashboards.

---

## 🚀 Features
- **Multi-Tenant Authentication**
  - Tenant signup & login with email/password
  - JWT-based authentication
- **Shopify App Integration**
  - OAuth flow for store installation
  - Syncs **customers, orders, products** via Shopify APIs
  - (Bonus) Handles custom events through webhooks
- **Data Ingestion**
  - Background job (poller) to fetch new data
  - Stores data in a PostgreSQL database via Prisma ORM
- **Dashboard API**
  - `/dashboard/summary` – business summary metrics
  - `/dashboard/orders-by-date` – order trends
  - `/dashboard/top-customers` – top spenders
  - `/dashboard/new-customers-by-date` – acquisition trends
  - `/dashboard/avg-order-value-by-date` – insights into order value
- **Secure Multi-Tenant Middleware**
  - Ensures tenant isolation via `x-tenant-id` header

---

## 🛠️ Tech Stack
- **Backend Framework**: Node.js + Express
- **Database ORM**: Prisma
- **Database**: PostgreSQL (hosted)
- **Auth**: JWT + bcrypt
- **Shopify Integration**: Shopify Admin APIs, Webhooks
- **Deployment Ready**: Works with Render/Heroku/Vercel (serverless-friendly)

---

## 📂 Project Structure
XENO_BACKEND
├── prisma/ # Prisma schema & migrations
├── src/
│ ├── controllers/ # Auth, Shopify, Dashboard controllers
│ ├── jobs/ # Poller for background ingestion
│ ├── middleware/ # Tenant middleware
│ ├── routes/ # API routes
│ ├── utils/ # Shopify client helper
│ ├── app.js # Express app
│ └── server.js # Entry point
├── .env # Environment variables (not committed)
├── .gitignore # Ignored files (node_modules, .env)
├── package.json
└── README.md

yaml
Copy code

---

## ⚙️ Setup & Installation

1. Clone the repository
   ```bash
   git clone https://github.com/<your-username>/xeno_backend.git
   cd xeno_backend
Install dependencies

bash
Copy code
npm install
Create .env file in root with:

env
Copy code
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_SCOPES=read_customers,read_orders,read_products
APP_URL=https://your-app-url.com
JWT_SECRET=your_secret
Run Prisma migrations

bash
Copy code
npx prisma migrate deploy
Start the server

bash
Copy code
npm start
🔗 Shopify App Installation
To install the app on a Shopify store, open:

perl
Copy code
https://<APP_URL>/api/shopify/install?shop=<your-shop-name>.myshopify.com
📊 Dashboard Endpoints
Example calls (requires JWT + tenant ID header):

GET /dashboard/summary

GET /dashboard/orders-by-date

GET /dashboard/top-customers

GET /dashboard/new-customers-by-date

GET /dashboard/avg-order-value-by-date

✅ Status
 Shopify store setup with dummy data

 Backend service with multi-tenant ingestion

 Secure tenant authentication

 Dashboard endpoints with insights

 Deployment (in-progress)

👤 Author
Built by Akil as part of the Xeno FDE Internship Assignment 2025.
