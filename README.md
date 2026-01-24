# Image Gallery Exercise

## Business Context

You've joined **PictoShare**, a startup building a collaborative image gallery platform for creative teams. The product is used by marketing agencies, design studios, and content creators to organize and share visual assets.

The application was initially built as an MVP by a contractor who has since left. It works, but barely. The product team has been collecting user feedback, and the main pain point is clear:

1. *"When I have lots of images, the page gets sluggish and scrolling is janky"*

Leadership wants to make this product **production-ready** for an upcoming demo with a major client.

## Your Task (~1.5 hours)

Your mission is to make this application production-ready. Specifically:

1. **Fix the performance issues** - The gallery currently loads 2000+ images and becomes sluggish. Implement optimizations to make scrolling smooth and scalable. Test it with network throttling to make sure it works for users with low bandwidth

2. **Create a beautiful interface** - Design a polished gallery that gracefully handles images of different aspect ratios (landscape, portrait, square).

**Bonus challenges:**
- *"I tried to add several images at once and it was painful"* - Add batch/multiple image upload support
- Add video upload and display support

Feel free to:
- Use any tools, libraries, or frameworks you find relevant
- Modify anything - frontend, backend, database, or all of the above
- Leave TODOs or notes explaining what you would do with more time

## What We're Evaluating

- **Performance optimization**: How you identify and fix performance bottlenecks
- **UI/UX design**: Creating a visually appealing, responsive gallery layout
- **Code quality**: Organization, readability, and maintainability
- **Problem-solving**: Your approach to understanding and fixing issues
- **Technical decisions**: Your choice of tools/patterns and ability to justify them
- **Communication**: How clearly you document decisions and trade-offs

## Getting Started

1. Start the application:
```bash
docker compose up --build
```

2. Open the app: http://localhost:5173

3. API docs: http://localhost:8000/docs

Both services have hot-reload enabled. Feel free to modify anything - frontend, backend, or both.
