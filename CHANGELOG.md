# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Prepared for open source release
- Added comprehensive README with setup instructions
- Added MIT License
- Added environment variables template (env.example)
- Added SECURITY.md for responsible disclosure
- Added CONTRIBUTING.md for contributor guidelines
- Server-side admin authentication with HTTP-only cookies
- Admin authentication API endpoints

### Changed
- Improved admin panel security (moved from client-side to server-side validation)
- Updated README with open source documentation

### Security
- **BREAKING:** Admin password now requires server-side authentication
- Added SESSION_SECRET environment variable for admin sessions
- Changed ADMIN_PASSWORD environment variable (no longer NEXT_PUBLIC_ADMIN_PASSWORD)

## [1.0.0] - 2025-01-XX

### Added
- Initial release
- Wallet-based authentication with TON Connect
- Telegram authentication integration
- Content hash generation (SHA-256)
- TON blockchain proof registration
- Proof verification system
- Watermark generation with QR codes
- User profile management
- Social account linking
- Admin panel for database management
- FAQ page with comprehensive information
- Mobile-responsive design
- SEO optimization
- Multi-language support (English)

### Technical
- Next.js 15 with App Router
- PostgreSQL database (Neon)
- TON blockchain integration
- TanStack Query for state management
- Tailwind CSS for styling

---

## How to Update This Changelog

When making changes, add them under `[Unreleased]` section using these categories:

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

When releasing a new version:
1. Change `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD`
2. Add a new `[Unreleased]` section at the top
3. Update version in package.json
4. Tag the release in git: `git tag v1.0.0`

### Versioning Guide

- **Major (X.0.0)** - Breaking changes
- **Minor (0.X.0)** - New features (backward compatible)
- **Patch (0.0.X)** - Bug fixes (backward compatible)

