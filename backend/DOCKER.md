# Backend Docker Deployment

## 1) Prepare environment

Use `backend/.env` (or copy from `backend/.env.example`) and set secure values:

- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (long random strings)
- `JWT_ISSUER`, `JWT_AUDIENCE`
- `CORS_ORIGIN` (public frontend URL)
- `LOG_LEVEL=info`

`DATABASE_URL` from `.env` is overridden by compose to use the `db` service.

## 2) Build and run

From `SACRM` directory:

```bash
docker compose -f docker-compose.backend.yml up -d --build
```

## 3) Verify

```bash
curl http://localhost:4000/healthz
curl http://localhost:4000/readyz
```

## 4) Stop

```bash
docker compose -f docker-compose.backend.yml down
```

To remove DB volume too:

```bash
docker compose -f docker-compose.backend.yml down -v
```
