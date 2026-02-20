# SA CRM Frontend (React)

Multi-page CRM frontend with route-based structure and reusable UI components.

## Pages

- `/login`
- `/dashboard`
- `/leads`
- `/clients`
- `/subscriptions`
- `/team`
- `/settings`

## Role Behavior

- `admin`
  - Sees admin dashboard metrics (employee progress, client count, paid revenue).
  - Can access `/team` and register new employees.
  - Can view all leads/clients/subscriptions.
- `sales` / `support`
  - Sees personal dashboard view.
  - Can create and follow up their own leads.
  - Backend automatically scopes leads/clients to their assigned records.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

## Build

```bash
npm run build
```

## Environment

- `VITE_API_BASE_URL` points to backend API, example:
  - `http://localhost:3000/api/v1`

## Structure

- `src/components/layout` shared shell
- `src/components/ui` reusable UI blocks
- `src/pages` route-level screens
- `src/services` API client modules
- `src/context` auth state
