# newsclip Test Plan

| | |
|---|---|
| **Status** | Draft v0.1 |
| **Author** | Amirah Azhar |
| **Date** | 2026-11-03 |
| **Application** | newsclip (RealWorld/Conduit clone), `app-under-test/` |

## 1. Purpose

Define what will be tested in newsclip, how, with what tools, and when testing is considered done. This plan also serves as the backbone of the QA portfolio: each section maps to a folder in this repo.

## 2. Application overview

```
Vue 3 SPA (Vite, :8080)  ──fetch + Bearer JWT──►  Express API (:3100/api)  ──►  MySQL 8 (knex)
```

- **Frontend:** Vue 3, Pinia, vue-router (`app-under-test/web`)
- **API:** Node/Express in TypeScript, split into `article`, `user` and `app` services (`app-under-test/api`)
- **Run locally:** Docker Compose for API and DB; `npm run serve` for the frontend (see README)

## 3. Scope

### In scope

| Area | Features |
|---|---|
| Authentication | Register, login, logout, session persistence, route guards |
| User settings | Update bio, image, email, password |
| Articles | Create, read, update, delete; markdown rendering; tags |
| Feeds | Global feed, following feed, filter by tag / author / favorited-by, pagination |
| Social | Favorite / unfavorite, follow / unfollow, public profiles |
| Comments | Add, list, delete |
| API | All endpoints under `/api` (users, profiles, articles, comments, favorites, tags, health-check) |
| Data | Referential integrity and uniqueness in MySQL |

### Out of scope

- Performance and load testing beyond a basic response-time sanity check
- Deployment/Lambda packaging and cloud infrastructure
- Third-party code internals (Vue, Express, MySQL)
- Internationalisation (app is English only)

## 4. Test approach

Tests follow a pyramid: most coverage at the API level, fewer UI end-to-end tests for critical journeys.

| Level | Tool | Location | Focus |
|---|---|---|---|
| API | pytest + requests; Postman/Newman | `api-tests/` | Every endpoint: happy path, validation (422), auth (401/403), not found (404), conflicts (409). Authorization between users. Pagination and filters. |
| UI E2E | Playwright (Chromium only for now) | `ui-tests/` | Critical user journeys. Page Object Model. State set up through the API where possible. |
| Data | SQL | `sql/` | Orphaned rows, duplicate slug/email/username, favorite counts vs. favorites table, cascade deletes. |
| Non-functional | Manual + Playwright | `ui-tests/`, `docs/` | XSS via markdown/comments, JWT expiry/tampering, basic accessibility, one mobile viewport. |
| AI/LLM eval | Rubric + runner | `ai-tests/` | Evaluate LLM-generated test cases or bug reports against a scoring rubric (optional). |
| Exploratory | Manual, session-based | `docs/` | Charters per feature area, findings logged as bug reports. |

### Test design techniques

Equivalence partitioning and boundary values (field lengths, page limits), state transition (logged out / logged in / token expired), decision tables (who can edit/delete what), and error guessing.

### Test data

- Each test creates its own unique users and articles (e.g. `qa_<timestamp>`) so tests are independent and can run in parallel.
- Prefer API calls over the UI to create preconditions.
- Cleanup: delete created articles via API; accept leftover users on the local DB and reset it with `docker compose down -v` as needed.

## 5. Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Authorization gaps (editing/deleting another user's article or comment) | Medium | High | Dedicated API tests with two users |
| Auth/session handling (expired or invalid token, guard redirects) | Medium | High | API and UI tests; token tampering checks |
| XSS through markdown or comment rendering | Medium | High | Payload tests; verify DOMPurify sanitisation |
| Slug collisions or duplicate titles | Medium | Medium | API + SQL uniqueness checks |
| Favorite/follow counts drifting from the DB | Low | Medium | SQL consistency queries |
| Frontend silently falls back to the public `api.realworld.show` if `VITE_API_URL` is unset | Medium | Medium | Verify `.env.local` in the test setup; assert the API host in a smoke test |
| Flaky UI tests from shared state or timing | Medium | Medium | Isolated data, web-first assertions, no fixed sleeps |

## 6. Test environment

| Item | Value |
|---|---|
| Frontend | http://localhost:8080 (Vite dev server) |
| API | http://localhost:3100/api |
| Database | MySQL 8.0 in Docker (`conduit-local`), migrated with knex |
| Browsers | Chromium (Playwright latest). Firefox and WebKit are configured out to keep CI fast; they can be re-added as extra `projects` in `playwright.config.ts`. |
| CI | GitHub Actions (ubuntu-latest) |
| Config | `.env` from `.env.example` (`BASE_URL`, `API_URL`, `API_TOKEN`, `LLM_API_KEY`) |

## 7. Entry and exit criteria

**Entry**
- API, DB and frontend start cleanly and `GET /api/health-check` returns 200
- Test accounts can be created
- Test code builds and lints

**Exit**
- 100% of P1 (critical) test cases executed and passing
- At least 95% of all planned tests executed; at least 90% pass
- No open Critical or High bugs
- Open Medium/Low bugs are documented with a decision
- CI pipeline is green on `main`

## 8. Feature coverage matrix

Status: ✅ done, 🟡 partial, ⬜ not started. Priority: P1 critical, P2 important, P3 nice to have.

| # | Feature | Priority | API | UI | SQL | Status |
|---|---|---|---|---|---|---|
| F1 | Register | P1 | ⬜ | ✅ happy path | ⬜ | 🟡 |
| F2 | Login (valid/invalid) | P1 | 🟡 (Postman) | ✅ | ⬜ | 🟡 |
| F3 | Logout / session persistence | P1 | n/a | ✅ | n/a | ✅ |
| F4 | Route guards (`/settings`, `/editor`, following feed) | P1 | 🟡 | ✅ | n/a | 🟡 |
| F5 | Update user settings | P2 | 🟡 | 🟡 bio, password, duplicate email; empty-field save blocked by [BUG-002](bugs/BUG-002.md) | ⬜ | 🟡 |
| F6 | Create article | P1 | 🟡 | ✅ happy path + missing title | ⬜ | 🟡 |
| F7 | Edit article (author only) | P1 | 🟡 | ✅ edit; non-author sees no controls | ⬜ | 🟡 |
| F8 | Delete article (author only) | P1 | 🟡 | ✅ delete; non-author sees no controls | ⬜ | 🟡 |
| F9 | Global feed + pagination | P1 | 🟡 | 🟡 page 1 ✅, page 2 blocked by [BUG-001](bugs/BUG-001.md) | n/a | 🟡 |
| F10 | Filter by tag / author / favorited | P2 | 🟡 | ✅ tag, author (profile) and favorited (profile) | n/a | ✅ |
| F11 | Following feed | P2 | 🟡 | ✅ empty state + followed author's article | ⬜ | ✅ |
| F12 | Favorite / unfavorite | P2 | 🟡 | ✅ toggle, persistence, profile list, signed-out redirect | ⬜ | ✅ |
| F13 | Follow / unfollow | P2 | 🟡 | 🟡 profile page ✅; article page blocked by [BUG-003](bugs/BUG-003.md) | ⬜ | 🟡 |
| F14 | Comments (add/list/delete) | P2 | 🟡 | ✅ add, empty rejected, delete own, others read-only, signed-out prompt | ⬜ | ✅ |
| F15 | Tags list | P3 | 🟡 | ⬜ | n/a | ⬜ |
| F16 | Profile pages | P3 | 🟡 | 🟡 author articles, favorites, follow button, bio | n/a | 🟡 |
| F17 | Markdown rendering / XSS sanitisation | P1 | n/a | 🟡 article body only (not titles/comments) | n/a | 🟡 |

"🟡 (Postman)" refers to the upstream collection in `app-under-test/api/tests/integration/`; it will be reviewed and replaced or extended by tests in `api-tests/`.

## 9. Deliverables

| Deliverable | Location |
|---|---|
| Test plan (this document) | `docs/test-plan.md` |
| Test cases | `docs/test-cases.md` |
| Bug reports | `docs/bugs/` |
| Playwright suite | `ui-tests/` |
| API tests | `api-tests/` |
| SQL checks | `sql/` |
| AI eval set and runner | `ai-tests/` |
| CI pipeline | `.github/workflows/` |
| Test summary report | `docs/test-summary.md` |

## 10. Schedule (proposed)

| Week | Milestone |
|---|---|
| 1 | Test plan and test cases drafted; CI moved to root and running against a started stack |
| 2 | API test suite (auth, articles, authorization) |
| 3 | UI E2E for critical journeys; SQL integrity checks |
| 4 | Non-functional checks, exploratory sessions, bug reports |
| 5 | AI eval, test summary, final cleanup |

## 11. Defect management

- Log each bug in `docs/bugs/BUG-<nnn>.md` with: title, severity, priority, environment, steps to reproduce, expected vs. actual, evidence (screenshot/trace), status.
- **Severity:** Critical (data loss, security, app unusable), High (major feature broken), Medium (feature works with workaround), Low (cosmetic).

## 12. Current gaps to resolve

- The CI workflow sits in `ui-tests/.github/workflows/`, which GitHub ignores. It needs to move to the repo root and start the API and frontend before running tests.
- `api-tests/`, `sql/`, `ai-tests/` and `docs/` (other than this file) are still empty.
- Test data cleanup is not yet implemented.

## 13. Open questions

- Should the upstream Postman collection be kept as a regression baseline or replaced?
- Is the AI/LLM evaluation in scope for the final portfolio, and against what subject (generated test cases, bug reports)?
- Which accessibility standard and tool (e.g. axe-core, WCAG 2.1 AA) should be the target?
