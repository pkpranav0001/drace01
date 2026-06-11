# Drace Core Haven

Handcrafted skincare brand website built with TanStack Start, React 19, and Tailwind CSS v4.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (tested with Node 24)
- npm (comes with Node)

## Local development

```bash
# 1. Copy env template and fill in your Supabase keys
cp .env.example .env

# 2. Install dependencies
npm.cmd install

# 3. Start the dev server (http://localhost:3000)
npm.cmd run dev
```

## Authentication (Supabase)

The app requires login before accessing any page. Public routes: `/login` and `/auth/callback`.

### Setup

1. Create a [Supabase](https://supabase.com) project.
2. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL` — project URL (e.g. `https://xxxx.supabase.co`, **not** `/rest/v1/`)
   - `VITE_SUPABASE_ANON_KEY` — anon/public key from Project Settings → API
   - `VITE_RAZORPAY_KEY_ID` — Razorpay test/live key ID
3. In Supabase Dashboard → **Authentication → URL Configuration**, add:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
4. Enable providers under **Authentication → Providers**:
   - **Email** (for OTP login)
   - **Google** (optional — add OAuth credentials from Google Cloud Console)

### Required Supabase tables

- `products` — catalog (name, price, stock, category, image_url, description, is_active)
- `carts` — one per user (`user_id`)
- `cart_items` — items in cart (`cart_id`, `product_id`, `quantity`)
- `orders` — completed orders (`user_id`, `order_number`, `total_amount`, `status`, optional `payment_id`)
- `order_items` — line items (`order_id`, `product_id`, `quantity`, `price`)

Enable RLS policies so authenticated users can read products and manage their own cart/orders.

## Payments (Razorpay)

- Razorpay checkout.js loads globally from `__root.tsx`
- Cart checkout: **Cart drawer → Proceed to checkout → Pay**
- Buy now: **Product page → Buy now → Pay** (skips cart)
- Free shipping on orders ≥ ₹999; otherwise ₹99 shipping is added
- After payment, order is saved to Supabase and you are redirected to `/orders`

Use Razorpay **test mode** keys locally. Test card: `4111 1111 1111 1111`, any future expiry, any CVV.

## End-to-end test flow

1. `npm.cmd run dev` → open http://localhost:3000
2. Redirected to `/login` → sign in (email OTP or Google)
3. Home/shop loads products from Supabase
4. **Cart flow**: open a product → Add to cart → cart drawer opens → Proceed to checkout → fill shipping → Pay
5. **Buy now flow**: open a product → Buy now → fill shipping → Pay (no cart step)
6. After payment → `/orders` shows your order
7. Account menu (user icon) → My orders / Sign out

## Production build

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## Project structure

```
src/
├── routes/          # File-based pages (/, /shop, /about, /contact)
├── components/      # UI components (Navigation, Footer, ProductCard, etc.)
├── assets/          # Images (hero, products, about)
├── lib/             # Products data, utilities, server config
├── router.tsx       # TanStack Router setup
├── server.ts        # SSR server entry
└── start.ts         # Request middleware
```

## Customization

- **Products**: Edit `src/lib/products.ts`
- **Contact links**: Update WhatsApp/Instagram URLs in `FloatingActions.tsx`, `Footer.tsx`, and `index.tsx`
- **Images**: Replace files in `src/assets/` with your own product and hero photos

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Development server       |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | ESLint                   |
| `npm run format`  | Prettier formatting      |
