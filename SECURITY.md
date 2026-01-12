# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within BERT Dashboard, please send an email to the maintainers. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

### What to Include

Please include the following information:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

## Security Best Practices

### For Users

1. **API Keys**: Never commit API keys to version control
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Updates**: Keep dependencies up to date
   ```bash
   npm audit
   npm audit fix
   ```

3. **HTTPS**: Always use HTTPS in production

4. **Content Security Policy**: Enable CSP headers

### For Contributors

1. **Dependencies**: 
   - Regularly update dependencies
   - Review dependency security advisories
   - Use `npm audit` before submitting PRs

2. **Code Review**:
   - All code changes require review
   - Security-sensitive changes require thorough review

3. **Input Validation**:
   - Validate all user inputs
   - Sanitize data before rendering
   - Use TypeScript for type safety

4. **Secrets Management**:
   - Never hardcode secrets
   - Use environment variables
   - Don't log sensitive information

## Known Security Considerations

### API Key Storage

The application requires a Gemini API key. Users should:
- Store keys in environment variables
- Never commit keys to version control
- Rotate keys regularly
- Use key restrictions when possible

### Client-Side Storage

The application uses localStorage for:
- User preferences
- Credit information
- Mode state

**Note**: Never store sensitive data in localStorage as it's accessible via JavaScript.

### Third-Party Dependencies

We use the following third-party services:
- Google Gemini API for AI functionality
- Tailwind CDN for styling

## Automated Security

### GitHub Actions

We use GitHub Actions for:
- Dependency vulnerability scanning
- Automated security audits
- Regular dependency updates

### Dependabot

Dependabot is enabled for:
- npm dependencies
- GitHub Actions
- Security updates

## Security Updates

Security updates are released as soon as possible. Users should:
- Watch the repository for updates
- Enable notifications for security advisories
- Update promptly when security patches are released

## Contact

For security concerns, please contact the repository maintainers through GitHub.

## Attribution

We appreciate responsible disclosure and will acknowledge security researchers who report vulnerabilities.
