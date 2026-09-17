# Sheinar — Deployment Guide

## Project Structure
```
sample-2-new-kaushal/
├── backend/        → Express API (deploy to Railway / Render / VPS)
├── my-app/         → Frontend (deploy to Vercel / Netlify)
└── admin/          → Admin Panel (deploy to Vercel / Netlify)
```

---

## Local Development

### 1. Backend
```bash
cd backend
npm install
npm run dev          # uses .env.development, runs on :5000
```

### 2. Frontend
```bash
cd my-app
npm install
npm run dev          # uses .env.development, runs on :5173
```

### 3. Admin Panel
```bash
cd admin
npm install
npm run dev          # uses .env.development, runs on :5174
```

---

## Environment Files

### Backend `.env.development` / `.env.production`
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for admin JWT tokens |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail App Password |
| `ADMIN_EMAIL` | Email that receives booking notifications |
| `RAZORPAY_KEY_ID` | Razorpay live/test key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signing secret; backend-only |
| `RAZORPAY_SUPPORTED_CURRENCIES` | Explicit account-enabled allowlist, for example `INR` or `INR,USD` |
| `FX_RATES_JSON` | Optional backend-only JSON rates relative to INR; never supplied by the frontend |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |

### Frontend / Admin `.env.development` / `.env.production`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Full URL to backend API (e.g. `https://api.sheinar.com/api`) |

---

## Production Deployment

### Backend → Railway / Render
1. Push `backend/` to a Git repo
2. Set all env variables from `.env.production` in the platform dashboard
3. Set `NODE_ENV=production`
4. Start command: `node server.js`

### Frontend → Vercel
1. Push `my-app/` to a Git repo
2. Set `VITE_API_URL=https://api.sheinar.com/api` in Vercel env vars
3. Build command: `npm run build`
4. Output dir: `dist`

### Admin → Vercel (separate project)
1. Push `admin/` to a Git repo
2. Set `VITE_API_URL=https://api.sheinar.com/api` in Vercel env vars
3. Build command: `npm run build`
4. Output dir: `dist`

### Update ALLOWED_ORIGINS on backend after deploying
Once you have your deployed URLs, update `ALLOWED_ORIGINS` in the backend env:
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://sheinar.com,https://www.sheinar.com,https://admin.sheinar.com,https://sheinar.vercel.app,https://sheinar-admin.vercel.app
```

---

## Admin Credentials
- URL (local): http://localhost:5174
- Set `ADMIN_INITIAL_USERNAME` and a strong `ADMIN_INITIAL_PASSWORD` only in the backend environment before running `node seed.js`.
- Never document or commit an actual admin password.
