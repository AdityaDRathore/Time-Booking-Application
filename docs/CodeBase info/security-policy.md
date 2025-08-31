# 🔐 Security Policy

## Authentication
- JWT-based access tokens with expiration
- Refresh token flow is isolated
- Role-based access using `checkRole()` middleware

## Request Protection
- Rate limiting with `express-rate-limit`
- CSRF protection using `csurf` with tokens in headers and cookies
- XSS input sanitization and HTML cleaning
- MongoDB injection neutralized using custom `mongoSanitize` middleware

## Headers
- Helmet middleware sets secure defaults
- CSP and HSTS enabled for HTTPS mode
