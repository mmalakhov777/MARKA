# Contributing to Marka

First off, thank you for considering contributing to Marka! 🎉

It's people like you that make Marka a great tool for creators worldwide.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Community](#community)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Our Standards

**Positive behavior includes:**
- ✅ Being respectful and inclusive
- ✅ Welcoming newcomers
- ✅ Accepting constructive criticism
- ✅ Focusing on what's best for the community
- ✅ Showing empathy towards others

**Unacceptable behavior includes:**
- ❌ Harassment or discriminatory language
- ❌ Trolling or insulting comments
- ❌ Personal or political attacks
- ❌ Publishing others' private information
- ❌ Other unprofessional conduct

## 🤝 How Can I Contribute?

### Reporting Bugs 🐛

Before submitting a bug report:
1. **Check the FAQ** - Your question might be answered
2. **Search existing issues** - Avoid duplicates
3. **Try latest version** - Bug might be fixed

**When reporting a bug, include:**
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

### Suggesting Features ✨

We love new ideas! Before suggesting a feature:
1. **Check existing suggestions** - Someone might have suggested it
2. **Consider the scope** - Does it fit Marka's philosophy?
3. **Think about use cases** - Who benefits?

**When suggesting a feature:**
- Explain the problem it solves
- Describe the desired solution
- Consider alternative approaches
- Note any related features

### Contributing Code 💻

**Areas where we need help:**
- Bug fixes
- Performance improvements
- UI/UX enhancements
- Documentation
- Tests
- Translations (i18n)
- Mobile responsiveness
- Accessibility improvements

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- PostgreSQL (or Neon account)
- TON wallet for testing
- Git

### Setup Steps

1. **Fork the repository** on GitHub

2. **Clone your fork**
```bash
git clone https://github.com/YOUR_USERNAME/marka.git
cd marka
```

3. **Add upstream remote**
```bash
git remote add upstream https://github.com/original/marka.git
```

4. **Install dependencies**
```bash
npm install
```

5. **Set up environment**
```bash
cp env.example .env.local
# Edit .env.local with your config
```

6. **Initialize database**
```bash
npm run init-db
```

7. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the app running!

### Development Workflow

1. **Create a branch** for your work
```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/nasty-bug
```

2. **Make your changes**
- Write clean, readable code
- Add comments for complex logic
- Follow existing patterns

3. **Test your changes**
```bash
npm run lint        # Check for errors
npm run build       # Test production build
```

4. **Commit your changes**
```bash
git add .
git commit -m "feat: add amazing feature"
```

5. **Keep your fork updated**
```bash
git fetch upstream
git rebase upstream/main
```

6. **Push to your fork**
```bash
git push origin feature/amazing-feature
```

## 🔄 Pull Request Process

### Before Submitting

- ✅ Code follows project style guidelines
- ✅ Comments added for complex code
- ✅ Documentation updated (if needed)
- ✅ Tested on both desktop and mobile
- ✅ No console errors or warnings
- ✅ Build succeeds (`npm run build`)
- ✅ Lint passes (`npm run lint`)

### Submitting

1. **Create Pull Request** on GitHub
2. **Fill out PR template** completely
3. **Link related issues** (e.g., "Fixes #123")
4. **Request review** from maintainers
5. **Be responsive** to feedback

### PR Title Format

Use conventional commits style:

```
feat: add bulk upload support
fix: resolve wallet connection timeout
docs: update environment variables guide
style: improve mobile navigation
refactor: simplify proof verification logic
test: add unit tests for hash validation
chore: update dependencies
```

### After Submission

- Be patient - reviews take time
- Respond to feedback promptly
- Make requested changes
- Re-request review after updates
- Don't force-push after review starts (unless asked)

## 🎨 Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Define types for all props and returns
- Prefer interfaces for objects
- Use `type` for unions/intersections

```typescript
// Good
interface ProofData {
  hash: string;
  fileName: string;
  createdAt: string;
}

// Bad
const proof: any = { ... }
```

### React Components

- Use functional components
- Prefer `"use client"` directive only when needed
- Keep components small and focused
- Extract reusable logic to hooks

```tsx
// Good
"use client";

interface Props {
  title: string;
  onSubmit: () => void;
}

export function MyComponent({ title, onSubmit }: Props) {
  // Implementation
}
```

### File Naming

- **Components:** PascalCase (`UserProfile.tsx`)
- **Utilities:** camelCase (`database.ts`)
- **Routes:** kebab-case (`my-route/page.tsx`)

### Code Organization

```typescript
// 1. Imports (grouped)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MyComponent } from "@/components/my-component";

// 2. Types/Interfaces
interface MyProps { ... }

// 3. Constants
const MAX_SIZE = 1024;

// 4. Component/Function
export function MyComponent({ }: MyProps) {
  // 4a. Hooks
  const [state, setState] = useState();
  
  // 4b. Handlers
  const handleClick = () => { ... };
  
  // 4c. Render
  return <div>...</div>;
}
```

### Comments

```typescript
// Good: Explain WHY, not WHAT
// Wait for blockchain indexing (usually 10-15 seconds)
await new Promise(resolve => setTimeout(resolve, 15000));

// Bad: Obvious comments
// Set loading to true
setLoading(true);
```

## 📝 Commit Message Guidelines

We use **Conventional Commits** for clear history:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style (formatting, no logic change)
- **refactor:** Code restructuring
- **test:** Adding/updating tests
- **chore:** Maintenance tasks

### Examples

```bash
# Feature
feat(upload): add drag-and-drop support

# Bug fix
fix(auth): resolve wallet disconnection issue

# Documentation
docs(readme): update installation instructions

# Multiple lines
feat(proof): add bulk verification

Added ability to verify multiple proofs at once.
Also improved performance by batching database queries.

Closes #123
```

## 🌍 Internationalization (i18n)

We welcome translations! To add a language:

1. Copy `locales/en.ts` to `locales/{lang}.ts`
2. Translate all strings
3. Add to `locales/index.ts`
4. Test thoroughly
5. Submit PR

## 🧪 Testing

Currently, we don't have automated tests (contributions welcome!).

**Manual testing checklist:**
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS and Android)
- [ ] Test wallet connection flow
- [ ] Test proof upload and verification
- [ ] Test admin panel
- [ ] Check console for errors

## 🐛 Debugging Tips

```bash
# Check TON blockchain connection
npm run diagnose-ton

# View recent proofs
npm run show-recent-proofs

# Check database connection
npm run init-db
```

## 📚 Resources

- **Next.js Docs:** https://nextjs.org/docs
- **TON Blockchain:** https://ton.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React Query:** https://tanstack.com/query/latest

## 🎯 Priority Areas

**High Priority:**
- 🔴 Bug fixes (especially critical ones)
- 🔴 Security improvements
- 🔴 Performance optimization
- 🔴 Mobile experience

**Medium Priority:**
- 🟡 New features (with clear use case)
- 🟡 UI/UX improvements
- 🟡 Documentation

**Low Priority (but still welcome!):**
- 🟢 Code cleanup
- 🟢 Test coverage
- 🟢 Nice-to-have features

## 💬 Community

### Getting Help

- **GitHub Discussions:** Ask questions
- **GitHub Issues:** Report bugs
- **Discord/Telegram:** [If available] Real-time chat

### Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes (for significant contributions)
- README acknowledgments

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution helps make Marka better for creators worldwide.

Whether it's code, documentation, bug reports, or ideas - we appreciate your time and effort!

**Happy coding! 🚀**

---

**Questions?** Open a Discussion or reach out to maintainers.

**Last Updated:** January 2025

