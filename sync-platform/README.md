## Orders & Inventory Sync Platform (`/sync-platform`)

NestJS service that:

- **Consumes Firebase Realtime Database** `products/{productId}` and `orders/{orderId}` data
- **Upserts into Postgres** using Prisma (`Product`, `Order`, `OrderItem`)
- **Runs an on‑demand sync job** via `POST /sync/run`
- **Exposes a GraphQL API** over the synced Postgres data


This folder represents the **Sync Platform** part of the overall “Orders & Inventory Mini Platform” (separate from the `/functions` Firebase REST API).

---

## Prerequisites

Before setting up the project, ensure you have the following installed and configured:

### 1. Runtime Environment
- **Node.js**: `v22.12.0` or higher (Required for Prisma 7 compatibility).
- **Package Manager**: `npm` or `yarn`.

### 2. Database (PostgreSQL)
- A running PostgreSQL instance.
- If using Docker, you can start one quickly with:
  ```bash
  docker run --name orders-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
  ```

---

## Tech Stack

- **Runtime**: Node.js, TypeScript
- **Framework**: NestJS
- **Database**: Postgres + Prisma ORM
- **External services**: Firebase Realtime Database (via `firebase-admin`)

---

## Environment Variables

Create a `.env` file in the root of `sync-platform`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/orders_inventory"
FIREBASE_KEY_PATH="secrets/firebase-service-account.json"
FIREBASE_DATABASE_URL="https://<your-project-id>.firebaseio.com"
SYNC_LOOKBACK_MINUTES=15
PORT=3000
```

- **`DATABASE_URL`**: Postgres connection string used by Prisma.
- **`FIREBASE_KEY_PATH`**: Path (relative to project root) to the Firebase service account JSON file used by `firebase-admin`.
- **`FIREBASE_DATABASE_URL`**: Firebase Realtime Database URL.
- **`SYNC_LOOKBACK_MINUTES`**: How many minutes of history to re-sync on service startup (idempotent upsert).
- **`PORT`** (optional): HTTP port for NestJS (defaults to `3000`).

---

## Database & Prisma

The minimal Prisma schema models:

- **`Product`**
- **`Order`**
- **`OrderItem`**
- **`OrderStatus` enum**: `PENDING | CONFIRMED | CANCELLED`
- **SKU uniqueness**: `Product.sku` is marked `@unique`.

To apply migrations locally:

```bash
npm install
npx prisma migrate dev
```

For an existing database (e.g. CI/prod):

```bash
npx prisma migrate deploy
```

---

## Install & Run

```bash
# from /sync-platform
npm install

# development
npm run start:dev

# production build
npm run build
npm run start:prod
```

The app listens on `http://localhost:<PORT>` (default `http://localhost:3000`).

On startup, the `SyncService`:

- Runs a **lookback sync** of products & orders updated in the last `SYNC_LOOKBACK_MINUTES`
- Registers **realtime listeners** on `products` and `orders` in Firebase RTDB

All writes into Postgres use **`upsert`** and transactions to ensure idempotency.

---

## REST Sync API

### `POST /sync/run`

Runs a **manual full sync** of all products and orders from Firebase into Postgres.

- **Method**: `POST`
- **URL**: `http://localhost:3000/sync/run`
- **Body**: none
- **Auth**: not required (this service is assumed to run in a trusted backend environment)

#### Sample `curl`

```bash
curl -X POST http://localhost:3000/sync/run \
```

#### Sample response

```bash
{"status":"success","message":"Full sync completed","timestamp":"2026-02-05T11:08:06.557Z","products":5,"orders":5}
```

---

## Sync Behaviour

- **Products source**: Firebase RTDB path `products/{productId}`
- **Orders source**: Firebase RTDB path `orders/{orderId}`
- **On startup**:
  - Reads products & orders with `updatedAt >= (now - SYNC_LOOKBACK_MINUTES)`
  - Upserts them into Postgres (`Product`, `Order`, `OrderItem`)
- **Realtime**:
  - Listens to `child_added` and `child_changed` events on both `products` and `orders`
  - For each event, calls a per‑record upsert to keep Postgres in sync
- **Idempotency**:
  - `Product`, `Order` and `(orderId, productId)` for `OrderItem` are upserted
  - Re-running startup lookback or `POST /sync/run` is safe

Expected Firebase shapes:

- **Product**

```json
{
  "id": "p_123",
  "name": "Coffee Beans",
  "sku": "CB-001",
  "price": 1299,
  "stock": 20,
  "updatedAt": 1738759200000
}
```

- **Order**

```json
{
  "id": "o_456",
  "userId": "firebaseUid",
  "items": [{ "productId": "p_123", "qty": 2, "unitPrice": 1299 }],
  "status": "PENDING",
  "total": 2598,
  "createdAt": 1738755600000,
  "updatedAt": 1738759200000
}
```

---

- `Product`: id, name, sku, price, stock, createdAt, updatedAt
- `OrderItem`: id, qty, unitPrice, product: Product!
- `Order`: id, userId, status, total, createdAt, updatedAt, items: [OrderItem!]!

### Example GraphQL query

query OrdersAndProducts {
  products(search: "coffee") {
    id
    name
    sku
    price
    stock
  }

  orders(userId: "firebaseUid", status: CONFIRMED) {
    id
    total
    status
    createdAt
    items {
      qty
      unitPrice
      product {
        id
        name
        sku
      }
    }
  }
}

---

## Logs & Observability

- NestJS logger is configured so that:
  - In **development**, you see `log`, `warn`, and `error`.
  - In **production**, only `warn` and `error` are logged.
- Sync operations are structured to be easily wrapped with additional logging/metrics if needed (e.g. per‑sync counts, durations).

