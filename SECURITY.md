# Security Policy

## 🔒 Security Philosophy

Marka is built on the principle of **trustlessness**. Our open-source approach allows anyone to audit the code and verify our claims about security and transparency.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes            |
| < 1.0   | ❌ No             |

## 🛡️ Security Features

### What We Protect
- **Database credentials** - Never exposed to client
- **Wallet seed phrases** - Server-side only, never logged
- **Admin authentication** - HTTP-only cookies, server-side validation
- **User privacy** - Minimal data collection

### What's Public (By Design)
- **Wallet addresses** - Required for verification
- **Content hashes** - One-way cryptographic fingerprints
- **Blockchain transactions** - Public blockchain by nature
- **Source code** - This repository

## 🐛 Reporting a Vulnerability

**Please DO NOT open public issues for security vulnerabilities.**

### How to Report

1. **Email:** marka.debtor093@passinbox.com (preferred)
2. **GitHub Security Advisory:** Use the "Security" tab → "Report a vulnerability"
3. **Private contact:** DM on Twitter/Telegram if you have our contact

### What to Include

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** assessment
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

### Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 7 days
- **Status updates:** Every 7 days until resolved
- **Fix timeline:** Depends on severity
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Best effort

## 🏆 Recognition

We appreciate responsible disclosure. If you report a valid security issue:

- **Public acknowledgment** (with your permission) in our changelog
- **Credit in SECURITY.md** (if you wish)
- **Swag/merch** (if available) for critical findings

We do not currently offer a bug bounty program, but we deeply appreciate your help in keeping Marka secure.

## 🔐 Security Best Practices for Self-Hosting

If you're running your own instance:

### Essential
1. ✅ **Change default admin password** - Set strong `ADMIN_PASSWORD`
2. ✅ **Generate session secret** - Use `openssl rand -base64 32`
3. ✅ **Protect wallet seed** - Never commit to git
4. ✅ **Use HTTPS** - Required for production
5. ✅ **Secure database** - Use SSL connections

### Recommended
6. 🔒 **Dedicated wallet** - Don't use personal/savings wallet
7. 🔒 **Environment separation** - Different wallets for dev/staging/prod
8. 🔒 **Regular backups** - Database and configuration
9. 🔒 **Monitor logs** - Watch for suspicious activity
10. 🔒 **Keep updated** - Regular dependency updates

### Advanced
11. 🛡️ **Rate limiting** - Add to API routes
12. 🛡️ **Firewall rules** - Restrict database access
13. 🛡️ **DDoS protection** - Use Cloudflare or similar
14. 🛡️ **Security headers** - CSP, HSTS, etc. (already configured)
15. 🛡️ **Regular audits** - Review access logs and permissions

## 🔍 Known Limitations

We believe in transparency. Here are known security considerations:

### By Design
- **Wallet addresses are public** - Required for verification system
- **Transaction history visible** - Public blockchain
- **No retroactive protection** - Only future content from announcement date
- **Social account trust** - Relies on platform verification

### Technical
- **Database compromise** - Could leak user metadata (not blockchain proofs)
- **Admin access** - Gives control over database (but not blockchain records)
- **Client-side wallet** - Users control their own keys (feature, not bug)

### Not Provided
- ❌ Content storage (we only store hashes)
- ❌ Legal proof of ownership
- ❌ Prevention of deepfakes being created
- ❌ Copyright verification

## 📋 Security Checklist for Contributors

Before submitting code:

- [ ] No hardcoded secrets or credentials
- [ ] Environment variables used for sensitive data
- [ ] No logging of sensitive information
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React does this by default)
- [ ] Authentication checked on protected routes
- [ ] HTTPS enforced in production
- [ ] Dependencies up to date
- [ ] No known vulnerable packages

## 🔄 Security Update Policy

- **Critical vulnerabilities:** Immediate patch + security advisory
- **High severity:** Patch within 7 days
- **Medium severity:** Included in next release
- **Low severity:** Scheduled with other improvements

Security updates are released as:
- Patch versions (1.0.x) for critical/high
- Minor versions (1.x.0) for medium/low

## 📚 Additional Resources

- **Environment Setup:** See `env.example`
- **Admin Security:** See admin authentication implementation in `lib/admin-auth.ts`
- **Blockchain Security:** See TON documentation at [ton.org](https://ton.org)
- **Next.js Security:** See [Next.js security headers](https://nextjs.org/docs/advanced-features/security-headers)

## 📞 Contact

For security-related inquiries only:
- **Email:** marka.debtor093@passinbox.com
- **PGP Key:** [Available on request]

For general questions, use GitHub Issues or Discussions.

---

**Last Updated:** January 2025  
**Version:** 1.0

