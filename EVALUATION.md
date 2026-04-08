# Evaluation

Light notes for reviewers.

## Todos (done)

- [x] User model + `owner_id`, JWT register/login/me, protect upload/delete + ownership
- [x] Daily quotas (10/user, 100 global UTC), `GET /quota`, paginated `GET /images`
- [x] Seed users + ~55 images; demo `alice`–`eve` / `demo123`
- [x] Frontend: login/register, Bearer token, quota, no manual user field on upload
- [x] Gallery pagination + XHR upload progress
- [x] Pytest quota test (`backend/tests/test_quota.py`)

## Optional next steps (not implemented)

Reasonable follow-ups if you extend the project:

- [ ] **Bonus (brief):** batch upload, search/filter on the gallery (title or owner)
- [ ] **Auth:** refresh tokens, password reset, rate limiting on login/register
- [ ] **Quotas:** automated test for **global** daily limit; optional per-user timezone instead of UTC-only
- [ ] **Pagination:** cursor-based pages
- [ ] **Quality:** Alembic (or similar) migrations; E2E tests (e.g. Playwright) for auth + upload flow; more API tests (403 delete, login errors)
