# qa-portfolio

Test automation and AI/LLM evaluation project.

## What this project covers
- UI automation (Playwright)
- API testing (Postman, pytest)
- SQL data checks
- CI with GitHub Actions
- AI/LLM evaluation with a rubric

## Application under test
**newsclip**, a news/blogging app (articles, comments, favorites, follows, tags). It lives in this repo under [`app-under-test/`](app-under-test), adapted from the MIT-licensed [RealWorld](https://github.com/gothinkster/realworld) example apps:

| Part | Folder | Stack | Local URL |
|------|--------|-------|-----------|
| Frontend | [`app-under-test/web`](app-under-test/web) | Vue 3, Pinia, Vite | http://localhost:8080 |
| API | [`app-under-test/api`](app-under-test/api) | Node/Express, MySQL, Docker Compose | http://localhost:3100/api |

## Project structure
- `docs/` test plan, test cases, bug reports
- `ui-tests/` Playwright tests
- `api-tests/` Postman collection and pytest
- `ai-tests/` LLM eval set and runner
- `sql/` data integrity queries

## How to run
1. **API** (needs Docker):
   ```sh
   cd app-under-test/api && docker compose up -d --build
   ```
2. **Frontend:**
   ```sh
   cd app-under-test/web
   cp .env.example .env.local   # points the app at http://localhost:3100/api
   npm install && npm run serve
   ```
3. **Tests:**
   ```sh
   cd ui-tests
   npm ci && npx playwright install chromium
   npx playwright test                       # Chromium (the only configured browser)
   BASE_URL=http://localhost:8080 npx playwright test
   ```

## AI-assisted workflow
(Add in Week 1)
