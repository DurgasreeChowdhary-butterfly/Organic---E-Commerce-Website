# Organic Store — Premium Organic Products E-commerce Platform

Production-ready scaffold for a premium organic products e-commerce platform.
**This is a structural scaffold, not a working application** — folders, configs,
routes, models, and stub functions are in place with `TODO` / `NotImplementedError`
markers wherever real business logic needs to be written.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Redux Toolkit + React Router, PWA-ready
- **Backend**: FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL + JWT auth
- **Payments**: Razorpay
- **AI Chatbot**: OpenAI/Gemini
- **Deployment**: Docker + docker-compose

## Project Structure

```
organic-ecommerce/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # Route handlers (auth, products, cart, orders, admin, ...)
│   │   ├── core/                # Config, security (JWT/password hashing), logging
│   │   ├── db/                  # SQLAlchemy engine/session/base
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── crud/                 # DB access layer (stubs)
│   │   ├── services/             # Business logic: payments, invoices, OTP, chatbot, notifications, storage
│   │   └── main.py               # FastAPI app entrypoint
│   ├── alembic/                  # DB migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/           # layout/, common/, product/, cart/, auth/, admin/, chatbot/
│   │   ├── pages/                # customer/, admin/
│   │   ├── features/              # Redux Toolkit slices (auth, cart, wishlist, products, orders)
│   │   ├── services/               # axios API clients per domain
│   │   ├── store/                  # Redux store setup
│   │   ├── routes/                 # Route table + auth/admin guards
│   │   └── types/                  # Shared TypeScript types
│   ├── vite.config.ts            # Includes vite-plugin-pwa for installable/mobile-app-like build
│   ├── tailwind.config.ts        # Brand palette: pista green, forest, cream, beige, gold, soft orange
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Getting Started

```bash
# 1. Copy env files and fill in secrets
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Run everything with Docker
docker-compose up --build

# Backend:  http://localhost:8000  (docs at /api/docs)
# Frontend: http://localhost:5173
```

Or run each side locally without Docker:

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## What's Implemented vs. What's Stubbed

**Implemented (structure only):**
- Full folder architecture for frontend and backend
- All SQLAlchemy models (User, Address, Product, Category, Cart, Wishlist, Order, Coupon, Review)
- All Pydantic schemas for the above
- All API routes registered with correct paths, tags, and dependency wiring (auth guards, admin guards)
- Redux store + slices for auth/cart/wishlist/products/orders
- Full route table (customer + admin) with route guards
- Tailwind theme matching the brand palette (pista green, forest, cream, beige, gold, soft orange)
- Docker + docker-compose for local dev
- PWA config (installable, manifest, icons) so the site can later be wrapped in an Android WebView

**Stubbed (raises `NotImplementedError` / has `TODO` comments):**
- Password hashing & JWT encode/decode (`core/security.py`)
- All CRUD functions (`crud/*.py`)
- All endpoint business logic (`api/v1/endpoints/*.py`)
- Razorpay integration (`services/payment_service.py`)
- GST invoice PDF generation (`services/invoice_service.py`)
- OTP/SMS delivery (`services/otp_service.py`)
- AI chatbot logic (`services/chatbot_service.py`)
- Email/notification sending (`services/notification_service.py`)
- File/image upload to cloud storage (`services/storage_service.py`)
- All React component internals (files render placeholder markup with `TODO` comments)

## Suggested Build Order

1. Backend: security.py → crud/user.py → auth endpoints → get_current_user dependency
2. Backend: product/category CRUD + endpoints → seed data
3. Frontend: apiClient interceptors → authSlice thunks → LoginForm/RegisterForm
4. Frontend: HomePage + ProductListingPage + ProductCard wired to real API data
5. Cart → Checkout → Razorpay → Order confirmation
6. Admin dashboard (stats, product/order/inventory management)
7. AI chatbot + WhatsApp handoff
8. PWA polish + Android WebView wrapper

## Future Android App

The frontend is built as a PWA (see `vite.config.ts`) with reusable REST APIs, touch-optimized
layouts, and no desktop-only assumptions. A lightweight Android WebView app can be generated
later by pointing it at the deployed frontend URL — no architecture changes needed.
