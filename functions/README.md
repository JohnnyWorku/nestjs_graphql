# Orders & Inventory Mini Platform — Firebase Functions (Express REST API)

This folder contains the **Firebase Functions** part of the "Orders & Inventory Mini Platform": an Express REST API that creates/updates **Orders** and **Inventory (Products)**, validates inputs, secures access with **Firebase Auth**, and writes to **Firebase Firestore**.

The full project also includes a Sync Platform (NestJS) and GraphQL API; this README covers only the **functions** app.

---

## 1. Project structure

```
functions/
├── index.js               
├── config/
│   └── env.js               
├── Controllers/
│   ├── auth.controller.js  
│   ├── error.controller.js 
│   ├── orders.controller.js 
│   └── products.controller.js 
├── Middleware/
│   ├── auth.middlware.js  
│   └── bodyValidator.js    
├── Models/
│   ├── order.model.js     
│   └── product.model.js  
├── Routes/
│   ├── auth.route.js      
│   ├── orders.route.js    
│   └── products.route.js  
├── utility/
│   └── asyncErrorHandler.js 
├── customeError.js       
├── permisions.json        
├── .env                  
├── package.json
└── README.md
```

---

## 2. Technical overview

- **Base path:** `/api/v1`
- **Auth:** All product and order endpoints require a Firebase ID token in `Authorization: Bearer <token>`.
- **Validation:** Request bodies are validated with **Zod** (see `Models/`).
- **Database:** **Firebase Firestore** — `products` and `orders` collections.
- **Behaviour:** Express middleware structure, central error handler, structured logging via `firebase-functions/logger`.

---

## 3. Environment variables

Create a `.env` file in the `functions` directory:

| Variable         | Description |
|------------------|-------------|
| `NODE_ENV`       | e.g. `development` or `production` (used by error handler) |
| `FIREBASEAPIKEY` | Firebase Web API Key (used by the sign-up route to create users and get ID tokens) |

**Service account (local run):**  
Place your Firebase service account JSON file as `permisions.json` in the `functions` folder. Do not commit this file; add `permisions.json` and `.env` to `.gitignore`.

---

## 4. Prerequisites

- **Node.js** (engine set to `24` in `package.json`)
- **Firebase CLI:** `npm install -g firebase-tools` and `firebase login`
- A **Firebase project** with:
  - Authentication (Email/Password or desired method) enabled
  - Firestore Database created
  - Service account key downloaded and saved as `permisions.json`
  - Web API Key (for sign-up) copied into `FIREBASEAPIKEY`

---

## 5. Setup

```bash
cd functions
npm install
```

Ensure:

1. `.env` exists with `NODE_ENV` and `FIREBASEAPIKEY`.
2. `permisions.json` exists (Firebase service account JSON).

If you use the Firebase Emulator, create a `firebase.json` at the **project root** (parent of `functions`) if needed, for example:

```json
{
  "functions": {
    "source": "functions",
    "predeploy": []
  }
}
```

---

## 6. Run locally

**Option A — Firebase Emulator (recommended)**

From the **project root** (parent of `functions`):

```bash
firebase emulators:start --only functions
```

Or from `functions`:

```bash
npm run serve
```

The API will be available at the URL shown in the terminal (e.g. `http://127.0.0.1:5001/<project-id>/us-central1/api`).

**Option B — Deploy and call deployed function**

```bash
npm run deploy
```

Then call the deployed HTTPS URL for the `api` function.

---

## 7. REST API reference

Base URL when using emulator: `http://127.0.0.1:5001/<your-project-id>/us-central1/api`

All **products** and **orders** endpoints require:

```http
Authorization: Bearer <Firebase ID token>
```

### Auth (no token required)

- **POST** `/api/v1/auth/signUp`  
  Body: `{ "email": "user@example.com", "password": "your-password" }`  
  Returns `idToken` (and optionally `refreshToken`, `uid`, `expiresIn`). Use `idToken` in `Authorization` for other endpoints.

### Products

- **POST** `/api/v1/products`  
  Create a product.  
  Body (example):
  ```json
  {
    "id": "p_123",
    "name": "Coffee Beans",
    "sku": "CB-001",
    "price": 1299,
    "stock": 20
  }
  ```

- **POST** `/api/v1/products/:id/stock`  
  Adjust stock by a delta (positive or negative).  
  Body:
  ```json
  { "stockChangeBy": 5 }
  ```
  or
  ```json
  { "stockChangeBy": -3 }
  ```

### Orders

- **POST** `/api/v1/orders`  
  Create an order in `PENDING` status. Validates that products exist and have enough stock.  
  Body (example):
  ```json
  {
    "id": "o_456",
    "userId": "<firebase-uid>",
    "items": [
      { "productId": "p_123", "qty": 2, "unitPrice": 1299 }
    ]
  }
  ```

- **POST** `/api/v1/orders/:id/confirm`  
  Confirms the order (status → `CONFIRMED`) and decrements product stock for each line item.

- **POST** `/api/v1/orders/:id/cancel`  
  Sets order status to `CANCELED`.

---

## 8. Sample cURL requests

Replace `BASE_URL` and `TOKEN` with your emulator/deployed URL and a valid Firebase ID token.

**1. Sign up and get token**

```bash
curl -X POST "%BASE_URL%/api/v1/auth/signUp" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Use the `token` (or `idToken`) from the response in the next requests.

**2. Create a product**

```bash
curl -X POST "%BASE_URL%/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer %TOKEN%" \
  -d "{\"id\":\"p_123\",\"name\":\"Coffee Beans\",\"sku\":\"CB-001\",\"price\":1299,\"stock\":20}"
```

**3. Adjust product stock**

```bash
curl -X POST "%BASE_URL%/api/v1/products/p_123/stock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer %TOKEN%" \
  -d "{\"stockChangeBy\":-2}"
```

**4. Create an order**

```bash
curl -X POST "%BASE_URL%/api/v1/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer %TOKEN%" \
  -d "{\"id\":\"o_456\",\"userId\":\"YOUR_FIREBASE_UID\",\"items\":[{\"productId\":\"p_123\",\"qty\":2,\"unitPrice\":1299}]}"
```

**5. Confirm order**

```bash
curl -X POST "%BASE_URL%/api/v1/orders/o_456/confirm" \
  -H "Authorization: Bearer %TOKEN%"
```

**6. Cancel order**

```bash
curl -X POST "%BASE_URL%/api/v1/orders/o_456/cancel" \
  -H "Authorization: Bearer %TOKEN%"
```

---

## 9. Error responses

Errors go through the global error handler and return JSON, for example:

- **Validation (Zod):** 4xx with message/errors from the schema.
- **Custom operational errors:** `statusCode` and `message` (e.g. product not found, insufficient stock, order already confirmed).
- **Production:** Non-operational errors return a generic 500 message without stack trace.

---

## 10. Domain model (Firestore)

- **products** collection: document ID = product `id`; fields: `name`, `sku`, `price`, `stock`, `updatedAt`.
- **orders** collection: document ID = order `id`; fields: `userId`, `items` (array of `{ productId, qty, unitPrice }`), `status` (`PENDING` | `CONFIRMED` | `CANCELED`), `total`, `createdAt`, `updatedAt`.


## 11. Summary vs task requirements

| Requirement              | Status |
|--------------------------|--------|
| Base path `/api/v1`      | Yes    |
| Firebase ID token auth  | Yes (`requireAuth` + Firebase Admin `verifyIdToken`) |
| POST /products          | Yes    |
| PATCH /products/:id/stock | Implemented as **POST** `/products/:id/stock`; same behaviour |
| POST /orders            | Yes (validates product existence and stock) |
| POST /orders/:id/confirm | Yes (marks CONFIRMED, decrements stock) |
| POST /orders/:id/cancel  | Yes (marks CANCELED) |
| Express middleware      | Yes (auth, body validator, global error handler) |
| Request validation (Zod) | Yes    |
| Clean error handling    | Yes (CustomError + globalErrorHandler) |
| Structured logging      | Yes (`firebase-functions/logger`) |
| Firebase backend        | **Firestore** (task mentioned Realtime Database; this app uses Firestore) |

For atomic confirm (order + stock decrement), consider refactoring to a single **Firestore transaction** in `confirmOrder` so that all updates succeed or fail together.
