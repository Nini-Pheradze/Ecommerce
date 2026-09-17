# ShopSpace — Client

Next.js (App Router) + TypeScript + Tailwind CSS frontend for the ShopSpace marketplace.

## Getting started

```bash
cd client
npm install
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000) and expects the API server
(see `../server`) running on `http://localhost:5000`. Copy `.env.local.example` to
`.env.local` if you need to point at a different API URL.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Axios for API calls
- React Context for auth / cart / wishlist state
