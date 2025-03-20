# Tech Stacks 

## Development Stack Choices

**CI/CD: GitHub Actions**

* **Pros:** Perfect initial choice with your GitHub repository, generous free tier.
* **Consideration:** You might occasionally hit the 2000 minute limit during heavy development months.
* **Migration path:** Your YAML configurations will translate easily to alternatives when needed.

**Backend Hosting: Railway**

* **Pros:** Developer-friendly with great GitHub integration, good free tier.
* **Consideration:** 500 hours means the app will need to sleep sometimes during development.
* **Migration:** Define your deployment as code (Docker/scripts) to make future migration seamless.

**Frontend: Vercel/Netlify**

* **Pros:** Both excellent for React apps with automatic preview deployments.
* **Slight edge to Vercel:** Slightly better integration with React applications.
* **Migration:** Your build process in `package.json` will work anywhere.

**Database: Neon PostgreSQL**

* **Pros:** The branching feature is fantastic for testing different schemas during development.
* **Consideration:** Being a newer service, monitor for stability.
* **Migration:** Prisma makes database switching relatively painless.

**Cache: Upstash Redis**

* **Pros:** API-based Redis works well with modern deployment models.
* **Consideration:** 10K requests/day should be sufficient for dev, but monitor usage.
* **Migration:** Your Redis implementation will be compatible with any Redis provider.

**Email: Resend**

* **Pros:** Good developer experience, sufficient free tier.
* **Consideration:** Implement a queue system to handle email sending reliably.
* **Migration:** Use an abstraction layer in your code for email services.

**Monitoring: LogSnag**

* **Pros:** Simple to implement, visual dashboard.
* **Consideration:** 1000 events get consumed quickly in active development.
* **Addition:** Consider adding free error tracking like open-source Sentry.

**Documentation: GitHub Wiki + Markdown**

* **Pros:** Keeps everything with your code, easy to maintain.
* **Consideration:** Set up a consistent structure from the beginning.
* **Migration:** Markdown is universally supported by documentation platforms.
