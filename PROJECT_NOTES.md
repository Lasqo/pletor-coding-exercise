# Project Notes

Based on the short-term goal (client demo) and the users feedbacks, i focused my efforts on the visible part of the product to make the demo successful (features you expect to see on a gallery, assets management app). Along the way, i invested in quick fixes that could improve overall perf, simplify features update and pave the way for a bigger refactor

## Customer demo with enterprise-ready features (show a gallery that galleries, users, perceived perf)

- entreprise ready feature ⇒ replace user name with a feature to set users permissions access
- display useful data in clear way ⇒ remove id from picture card, format data
- show feedback on user actions ⇒ on success, on fail
- prevent destructive user actions ⇒ Image deletion confirm prompt
- improve layout and usage with large content ⇒ sticky header
- lazy load images

## Normalize codebase (perfs, errors management)

- basic setup (tsconfig, prettier)
- stick to a single styling source of truth
- create components to isolate re renders
- add an error boundary if the app crashes
- remove unnecessary code (css, duplicates)

## Todo

### Features

- Enterprise ready : users access management system, invite collaborators, remove, etc
- add an image file picker and allow multiple images upload
- if the clients platform allow it, create a sync service that connects to their platform (can be specific depending on the contract size)
- enable images filter / search through queries (do not search locally)
- allow image date edit
- Enterprise readiness : a11y
- Enterprise readiness : i18n
- optimize uploaded images on backend side (size / weight)

### Code

- fix security issues (protect API routes with authentication, validate uploaded content like urls, fix CORS, add rate limits, etc)
- add E2E (app is running) and integration tests (upload form) that run on CI to prevent regressions
- add a router to enable persistency and shareable views
- enable automatic typing of backend queries to improve DX, prevent errors
- fetch data with react-query to benefit from cache and improve loading
- paginate queries to prevent loading issues
- reorganize code (pages / components / utils / hooks / design system)
- create a design system with basic UI components (card, inputs, button)
- add design tokens
- rework styling with static css (tailwind)
- build features components with UI components
