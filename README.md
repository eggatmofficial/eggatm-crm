# CRM Panel

A standalone frontend for the customer-loyalty CRM flow (separate from the
main restaurant/POS admin app), built against the same `eggatm_franchise`
backend.

Implements the two flows from the reference sketch:

**Admin Dashboard** (`superadmin` login)
- Create franchise
- Total customers + franchise-wise customer count
- Click a franchise → see its customers' phone numbers
- Download Excel (per franchise, or all franchises at once)
- Inline-editable reward config per franchise (₹ per point, points needed for reward)

**Franchise Owner / Sub Admin** (`franchise` login)
- Total customer count
- Add customer (phone + bill amount) → awards loyalty points → "Points added successfully"
- View customers (search by name/phone)
- Check Customer Points widget (mobile number → points, name; Add to Contact if not found)
- Rewards page → customers past the reward threshold → Save to contacts / Redeem

## Setup

```bash
npm install
cp .env.example .env      # point VITE_API_URL at your backend, e.g. http://localhost:5000/api
npm run dev
```

## Backend requirements

This app expects the **modified** backend (see `backend-modified.zip`), which adds:

- `POST /customers` — add customer purchase (phone, name, billAmount)
- `POST /customers/contact` — quick add-to-contact
- `GET /customers` — list this franchise's customers (`?search=`)
- `GET /franchise/customers/summary` — franchise-wise customer counts (superadmin)
- `GET /franchise/:id/customers` — a franchise's customers/phone numbers (superadmin)
- `GET /franchise/customers/export?franchiseId=` — Excel download (superadmin)
- `PATCH /franchise/:id/rewards-config` — edit `pointsPerAmount` / `rewardThreshold` (superadmin)

Login uses the existing `POST /auth/login` and routes by `user.role`
(`superadmin` → `/admin`, `franchise` → `/franchise`), same as your admin app.

## Notes / assumptions

- Loyalty points earned per Add = `floor(billAmount / franchise.pointsPerAmount)`, default ₹100 = 1 point.
- A customer becomes "reward eligible" once `loyaltyPoints >= franchise.rewardThreshold` (default 90, editable per franchise from the Admin Dashboard table).
- Excel export uses `exceljs` on the backend (added to `package.json` — run `npm install` on the backend after unzipping).
