# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

We take the security of this project seriously. If you discover a security vulnerability, please report it by emailing **muhammedadnanshakil456@gmail.com**.

Please do **not** create a public GitHub issue for security vulnerabilities.

### What to include

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (if known)

### Response timeline

- **48 hours:** Acknowledgment of your report
- **7 days:** Initial assessment and confirmation
- **30 days:** Fix deployed (depending on complexity)

We ask that you allow us reasonable time to patch and disclose the vulnerability before any public disclosure.

## Security Best Practices

- Never commit `.env` files or API keys to version control
- Use environment variables for all secrets (`OPENROUTER_API_KEY`, `GRAPHHOPPER_API_KEY`)
- AWS Lambda IAM policies follow least-privilege principles
- CockroachDB credentials should be stored in AWS Secrets Manager (not hardcoded)
- Frontend communicates with backend via CORS-whitelisted origins only
