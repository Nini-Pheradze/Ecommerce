# NodeShip — Frontend

მინიმალისტური, თანამედროვე Next.js 14 (App Router) + TypeScript + Tailwind frontend თქვენი Express/MongoDB e-commerce backend-ისთვის (`Ecommerce/server`).

## გაშვება

```bash
npm install
cp .env.local.example .env.local   # ჩაწერეთ თქვენი backend-ის URL
npm run dev
```

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Backend-ი (`server.js`) ცალკე უნდა გაუშვათ `npm run dev` საქაღალდეში `server/` (მოითხოვს `.env`-ში `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY` და ა.შ.).

## სტრუქტურა

- `src/app` — გვერდები (App Router): მთავარი, `/products`, `/products/[id]`, `/cart`, `/checkout`, `/login`, `/register`, `/account`, `/wishlist`, `/search`
- `src/components` — UI კომპონენტები (ProductCard, Filters, AddToCartPanel, ReviewSection და ა.შ.)
- `src/context` — Auth / Cart / Wishlist context-ები (JWT ინახება `localStorage`-ში)
- `src/lib/api.ts` — ცენტრალური fetch wrapper ყველა REST call-ისთვის
- `src/types` — TypeScript ტიპები, გადაწერილი პირდაპირ თქვენი Mongoose schema-ებიდან

## რას აკეთებს ეს frontend

- პროდუქტების ჩვენება ფილტრებით (კატეგორია, ფასდაკლება, sort, pagination) — `GET /api/products`
- პროდუქტის დეტალები + ვარიანტები (size/color) + მიმოხილვები + related products
- Cart — `GET/POST /api/cart`, `DELETE /api/cart/:productId`
- Checkout — ქმნის შეკვეთას (`POST /api/orders`) და გადამისამართებს Stripe Checkout სესიაზე (`sessionUrl`)
- Auth — რეგისტრაცია/login JWT-ით (`/api/auth/register`, `/login`), token ინახება ბრაუზერში
- Wishlist — `GET/POST /api/wishlist`, `DELETE /api/wishlist/:productId`
- Search — `GET /api/search/products?query=...`

## ⚠️ შენიშვნები backend-ის შესახებ (ღირს გასწორება)

Backend-ის კოდის წაკითხვისას შევნიშნე რამდენიმე შეუსაბამობა schema-სა და controller-ს შორის, რაც გავლენას მოახდენს frontend-ზეც:

1. **პროდუქტის სურათები არ ინახება.** `Product` schema-ში არ არის განსაზღვრული `imageCover` და `images` ველები, თუმცა `productController.js` მათ `req.body`-ში წერს ატვირთვისას. Mongoose-ის სტანდარტული `strict: true` რეჟიმის გამო ეს ველები აგნორირდება შენახვისას — ანუ ატვირთული ფოტოები რეალურად არასდროს ინახება პროდუქტთან. **გამოსავალი:** დაამატეთ `Product.js`-ში:
   ```js
   imageCover: { type: String },
   images: [String],
   ```
   ამის გარეშე frontend ავტომატურად აჩვენებს placeholder-მონოგრამას სურათის ნაცვლად (ეს უკვე გათვალისწინებულია).

2. **Order items არ ინახება სწორად.** `Order` schema-ს აქვს ველი `orderItems`, მაგრამ `orderController.js`-ის `createOrder`-ში იწერება `items: orderItems` — სახელების შეუსაბამობის გამო ეს მასივი არ შეინახება. ასევე `subtotal`, `discountAmount`, `paymentStatus` schema-ში საერთოდ არ არსებობს. **გამოსავალი:** ან `orderController.js`-ში გამოიყენეთ `orderItems:` key, ან დაამატეთ ეს ველები `Order.js` schema-ში.

3. **Reviews route არ არის nested product-ზე.** `server.js`-ში `reviewRoutes` არის მიბმული პირდაპირ `/api/reviews`-ზე (არა `/api/products/:id/reviews`), ხოლო `getAllReviews` filter-ს აკეთებს მხოლოდ `req.params.productId`-ზე (რომელიც ამ route-ზე არასდროს არსებობს) და არა `req.query.product`-ზე. ამიტომ ეს endpoint ყოველთვის აბრუნებს **ყველა** მიმოხილვას ყველა პროდუქტისთვის. Frontend-მა ეს დროებით client-side filter-ით მოაგვარა (`review.product === productId`), მაგრამ სწორია `searchController.js`-ის მსგავსად `req.query.product`-ის მხარდაჭერის დამატება backend-ზე.

4. **`searchProducts`-ში category ველზე `$regex`.** `Product.category` არის `ObjectId`, არა `String` — რეგულარული გამოსახულების ძებნა ამ ველზე Mongoose-ში cast შეცდომას გამოიწვევს. თუ პრობლემას შეამჩნევთ ძებნისას, საჭირო იქნება ამ ხაზის ამოღება ან switch აგრეგაციაზე კატეგორიის სახელით populate-ის შემდეგ.

არცერთი ეს ხარვეზი frontend-ს არ აჩერებს — ყველგან არის fallback (placeholder სურათი, ცარიელი მასივები, try/catch), მაგრამ სასურველია backend-ზე გასწორდეს რეალურ პროდაქშენში გამოსაყენებლად.

## დიზაინის მიმართულება

მინიმალისტური "editorial" ესთეტიკა: თბილი ქაღალდისფერი ფონი, მელნისფერი ტექსტი, rust-ფერი აქცენტი, Fraunces (italic display) + Archivo (body) ფონტების წყვილი, გენერაუსი whitespace, თხელი ხაზები დელიმიტერების ნაცვლად ბარათებზე.
