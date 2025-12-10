# Image Gallery Exercise

## Context

You've joined a team that inherited this image gallery application. The product team has collected user feedback and identified several pain points:

1. *"Adding images is really clunky - I have to find URLs somewhere else first"*
2. *"When I have lots of images, the page gets sluggish"*
3. *"Sometimes things fail and I have no idea what went wrong or what to do"*
4. *"I tried to add several images at once and it was painful"*

The previous developer left the codebase in a... let's say "functional" state.

## Your Task (~1.5 hours)

Address the user feedback and make this gallery production-ready.

We're more interested in seeing your thought process and how you prioritize than in seeing everything completed. Feel free to leave TODOs or notes about what you would do with more time.

## What We're Evaluating

- How you identify and prioritize problems
- Your approach to UX decisions and trade-offs
- Code organization and architecture choices
- How you handle edge cases and failures
- Performance awareness

## Getting Started

1. Start the application:
```bash
docker compose up --build
```

2. Open the app: http://localhost:5173

3. API docs: http://localhost:8000/docs

Both services have hot-reload enabled. Feel free to modify anything - frontend, backend, or both.


# Post-scriptum

## Questions/remarks:

- I assume this is not a UI design test and will not spend time on UI/styles
- is a maintainable codebase part of our "production-ready" definition here?
- I see no typescript config file, that causes some issues with module resolution, was i supposed to add one or just go with vite/esbuild default behavior?
- There's no PATCH endpoint to update images title or user, was i supposed to add one? is it a part of the exercise?

## Next Steps:

- improve the UI design
- use a proper object-storage service like s3 for file hosting
- add pagination with infinite scroll
- add image item edit "on the fly"
- allow to set a global `user` value
- prefill titles with filenames (not the best UX but it'll allow to batch upload images and edit later)
- use a data fetching library
- use a form state management library
- add prettier/biome
- add search (by title or user)