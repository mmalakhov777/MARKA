# 🔐 Marka - Trustless Blockchain Content Authentication

> **Register your content on TON blockchain. Your wallet. Your proof. Forever.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TON](https://img.shields.io/badge/TON-Blockchain-0088CC)](https://ton.org/)

**Production URL:** [https://marka-proof.org](https://marka-proof.org)

---

## 📖 Table of Contents

- [What is Marka?](#-what-is-marka)
- [Why Open Source?](#-why-open-source)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Development](#-development)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🎯 What is Marka?

Marka is a **trustless blockchain-based content authentication service** that allows creators to:

✅ **Register content** on the TON blockchain with cryptographic proof  
✅ **Generate watermarks** with QR codes for verification  
✅ **Prove authenticity** through wallet-based verification  
✅ **Build trust** without relying on centralized authorities  

### Core Principle

**We are NOT an authority claiming to verify your content.**

We provide tools that help you make public commitments on blockchain. You verify yourself via your announced wallet. Your audience verifies by checking blockchain. We're just infrastructure.

**Trust the blockchain, not us.**

---

## 🌐 Why Open Source?

Our service philosophy is built on **trustlessness**:

- **Transparency:** Anyone can audit the code and verify there are no backdoors
- **Security:** Community-reviewed code is more secure
- **Independence:** Your proofs exist on blockchain, independent of our servers
- **Proof of Concept:** Open source proves our claims about how the system works

Even if we disappear tomorrow, your blockchain registrations remain forever.

---

## 🚀 Key Features

### For Creators
- **Wallet-First Authentication** - Your wallet = your identity (trustless and permanent)
- **SHA-256 Content Hashing** - Generate cryptographic fingerprints of your files
- **TON Blockchain Registration** - Permanent, immutable proof on public blockchain
- **Watermark Generation** - Create branded watermarks with QR verification codes
- **Social Account Linking** - Connect verified social media for stronger identity proof

### For Verifiers
- **Public Verification** - Anyone can verify content without an account
- **Blockchain Explorer Links** - Direct links to TON blockchain transactions
- **QR Code Scanning** - Quick verification via watermarks
- **Registration History** - View all registrations for a given wallet

### Technical
- **Async Transaction Processing** - Fast user experience with background verification
- **Auto-Reconnect** - Wallet-based auth means accounts auto-recreate if deleted
- **Mobile-First Design** - Optimized for creators on the go
- **SEO Optimized** - Dynamic metadata for each proof page

---

## 🔍 How It Works

```
1. Creator publicly announces their TON wallet address on verified social media
   ↓
2. Creator uploads content → System generates SHA-256 hash
   ↓
3. Creator's wallet sends 0.05 TON transaction with hash in comment
   ↓
4. Transaction confirmed on TON blockchain (permanent record)
   ↓
5. Creator adds watermark with QR code to their content
   ↓
6. Anyone can verify: Upload content → Check hash → Verify on blockchain
```

**Key Points:**
- The blockchain only stores the **hash** (cryptographic fingerprint), not the actual content
- Verification proves: "This wallet registered this content at this time"
- It does NOT prove original creation or legal ownership
- Protection is **forward-looking**, not retroactive

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Blockchain** | TON (The Open Network) |
| **Database** | PostgreSQL (Neon) |
| **Styling** | Tailwind CSS 4 |
| **Authentication** | TON Connect + Telegram SDK |
| **State Management** | TanStack Query (React Query) |
| **Blockchain Library** | `@ton/crypto`, `ton` |
| **Deployment** | Vercel / Render |

---

## 📦 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** (LTS recommended)
- **npm** / **yarn** / **pnpm**
- **PostgreSQL database** (we recommend [Neon](https://neon.tech/) for serverless Postgres)
- **TON wallet** with some TON for testing ([Tonkeeper](https://tonkeeper.com/) or [TON Wallet](https://wallet.ton.org/))
- **TON Center API key** (optional but recommended) from [toncenter.com](https://toncenter.com/)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/marka.git
cd marka
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
# Copy the example file
cp env.example .env.local

# Edit .env.local with your configuration
nano .env.local  # or use your preferred editor
```

See [Environment Variables](#environment-variables) section for detailed configuration.

4. **Initialize the database**

```bash
npm run init-db
```

This creates all necessary tables and indexes.

5. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Environment Variables

**Required variables for local development:**

Create a `.env.local` file (copy from `env.example`):

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# TON Blockchain
TON_WALLET_ADDRESS=UQAbc123...              # Your wallet address
TON_WALLET_SEED="word1 word2 ... word24"    # 24-word seed phrase (KEEP SECRET!)
TONCENTER_ENDPOINT=https://toncenter.com/api/v2/jsonRPC
TONCENTER_API_KEY=your_api_key              # From toncenter.com

# Public Config (exposed to client)
NEXT_PUBLIC_TON_WALLET_ADDRESS=UQAbc123...  # Same as TON_WALLET_ADDRESS
NEXT_PUBLIC_TONSCAN_BASE_URL=https://tonscan.org/tx
NEXT_PUBLIC_PROOF_AMOUNT=0.05               # Cost per proof in TON

# Admin Panel
ADMIN_PASSWORD=your_secure_password         # Change from default!
SESSION_SECRET=random_32_character_secret   # Generate with: openssl rand -base64 32

# Optional
TELEGRAM_BOT_TOKEN=your_bot_token           # If using Telegram auth
```

⚠️ **Security Notes:**
- Never commit `.env.local` to git (it's in `.gitignore`)
- `TON_WALLET_SEED` controls your funds - treat it like a password!
- Use a dedicated wallet for this service, not your personal wallet
- Change `ADMIN_PASSWORD` from default immediately

See `env.example` for full documentation of all variables.

---

### Database Setup

The project uses PostgreSQL. We recommend **Neon** for serverless Postgres.

**Option 1: Neon (Recommended)**

1. Sign up at [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy the connection string to `DATABASE_URL` in `.env.local`
4. Run `npm run init-db`

**Option 2: Local PostgreSQL**

1. Install PostgreSQL locally
2. Create a database: `createdb marka`
3. Set `DATABASE_URL=postgresql://localhost:5432/marka`
4. Run `npm run init-db`

**Database Schema:**

The system creates these tables:
- `users_v2` - User accounts (wallet + Telegram data)
- `proofs` - Content registrations
- `social_accounts` - Linked social media accounts

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run init-db      # Initialize database schema
npm run db:migrate   # Run migrations (see scripts/ folder)

# Utilities
npm run diagnose-ton # Test TON blockchain connection
```

### Development Workflow

1. **Make changes** to your code
2. **Test locally** with `npm run dev`
3. **Check for errors** with `npm run lint`
4. **Test production build** with `npm run build`
5. **Commit changes** (semantic commit messages recommended)

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js recommended rules
- Prettier for code formatting (recommended)
- Use `"use client"` directive for client components
- Server components by default in App Router

---

## 🚀 Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy!

**Important:** Set these in Vercel Environment Variables:
- All variables from `env.example`
- Set `NODE_ENV=production`
- Use **mainnet** TON endpoints for production

### Render

See `render.yaml` for configuration.

```bash
# Build command
npm install && npm run build

# Start command  
npm start
```

Add environment variables in Render dashboard.

### Docker (Optional)

A `Dockerfile` is included for containerized deployment:

```bash
docker build -t marka .
docker run -p 3000:3000 --env-file .env.local marka
```

---

## 📁 Project Structure

```
marka/
├── app/                        # Next.js 15 App Router
│   ├── (main)/                # Main app routes (protected)
│   │   ├── faq/              # FAQ page
│   │   ├── levels/           # Creator levels
│   │   ├── profile/          # User profile
│   │   ├── proofs/           # User's proofs list
│   │   ├── proof/[id]/       # Proof verification page
│   │   ├── result/[id]/      # Registration result
│   │   └── social/           # Social media linking
│   ├── admin/                 # Admin panel (protected)
│   ├── api/                   # API routes
│   │   ├── admin/            # Admin APIs (auth protected)
│   │   ├── auth/             # Authentication
│   │   ├── proof/            # Proof submission/verification
│   │   ├── hash/             # Hash operations
│   │   └── user/             # User management
│   ├── onboarding/            # Onboarding flow
│   ├── layout.tsx             # Root layout with providers
│   └── providers.tsx          # Context providers
├── components/                 # Reusable React components
│   ├── upload-form.tsx        # Main upload interface
│   ├── user-profile.tsx       # User profile display
│   ├── proof-details.tsx      # Proof information
│   └── connect-wallet-*.tsx   # Wallet connection UI
├── lib/                        # Utility functions
│   ├── database.ts            # Database connection & queries
│   ├── ton.ts                 # TON blockchain integration
│   ├── validation.ts          # Zod schemas
│   ├── admin-auth.ts          # Admin authentication
│   ├── wallet-auth.tsx        # Wallet authentication
│   └── telegram-*.tsx         # Telegram integration
├── locales/                    # i18n translations
├── public/                     # Static assets
├── scripts/                    # Database migration scripts
├── env.example                 # Environment variables template
├── LICENSE                     # AGPL-3.0 License
├── README.md                   # This file
└── package.json               # Dependencies
```

---

## 📡 API Documentation

### Public Endpoints

#### `GET /api/hash?hash={hash}`
Verify if a content hash exists on blockchain.

**Response:**
```json
{
  "success": true,
  "proof": {
    "hash": "abc123...",
    "tonscanUrl": "https://tonscan.org/...",
    "createdAt": "2025-01-01T00:00:00Z",
    "walletAddress": "UQAbc..."
  }
}
```

#### `POST /api/proof/submit`
Submit a new proof (requires wallet connection).

**Request:**
```json
{
  "hash": "abc123...",
  "fileName": "image.png",
  "fileSize": 123456,
  "fileType": "image/png",
  "userId": "uuid",
  "boc": "base64_encoded_transaction"
}
```

### Admin Endpoints (Protected)

All admin endpoints require authentication cookie.

#### `POST /api/admin/auth`
Login to admin panel.

#### `GET /api/admin/proofs`
List all proofs in database.

#### `GET /api/admin/users`
List all users.

See source code in `app/api/` for full API documentation.

---

## 🔒 Security

### What We Protect

✅ **Database connection strings** - Never committed to git  
✅ **Wallet seed phrases** - Environment variables only  
✅ **Admin passwords** - Server-side validation with HTTP-only cookies  
✅ **User data** - Privacy-first design  

### What's Public

- Wallet addresses (by design - required for verification)
- Blockchain transactions (public blockchain)
- Content hashes (one-way cryptographic fingerprints)
- Source code (this repository)

### Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Use strong admin password** - Change from default
3. **Dedicated wallet** - Don't use personal savings wallet
4. **HTTPS only** - Required for production
5. **Regular updates** - Keep dependencies updated

### Reporting Security Issues

**Do NOT open public issues for security vulnerabilities.**

Email: [security@marka-proof.org] (or create private security advisory on GitHub)

---

## ❓ FAQ

### General Questions

**Q: What does this service do?**  
A: We provide tools for creators to publicly commit to marking their content on blockchain. You announce your wallet, register content from that wallet, and anyone can verify.

**Q: Do you verify that I own my content?**  
A: No. You verify yourself by publicly announcing your wallet on social media. We just provide the registration tool.

**Q: Can I trust you?**  
A: You shouldn't have to! That's the point. Your proofs exist on blockchain independently of us. Even if we disappear, your registrations remain.

### Technical Questions

**Q: How much does it cost?**  
A: ~0.05 TON per proof (~$0.03-0.05 USD). This covers blockchain transaction costs.

**Q: Can I self-host this?**  
A: Yes! That's why it's open source. Clone it, deploy it, run your own instance.

**Q: What happens if your servers go down?**  
A: Proof registrations remain on TON blockchain forever. Anyone can verify them by checking the blockchain directly.

**Q: Is this legally recognized proof of ownership?**  
A: No. Blockchain registration is ONE piece of evidence, not legal proof. You'll need additional documentation for legal cases.

For more questions, see our [FAQ page](https://marka-proof.org/faq) or the comprehensive FAQ in `app/(main)/faq/page.tsx`.

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Types of Contributions

- 🐛 **Bug fixes** - Find and fix issues
- ✨ **New features** - Propose and implement improvements
- 📖 **Documentation** - Improve README, code comments, guides
- 🌍 **Translations** - Add support for more languages
- 🎨 **Design** - Improve UI/UX
- 🧪 **Testing** - Add tests, improve coverage

### Contribution Workflow

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test thoroughly** - Ensure nothing breaks
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Write clean, commented code
- Follow existing code style
- Update documentation for new features
- Test on both desktop and mobile
- Consider security implications
- Use semantic commit messages

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Report security issues privately

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** - see the [LICENSE](LICENSE) file for details.

**What this means:**
- ✅ You can use this code commercially
- ✅ You can modify and distribute
- ✅ You can use privately
- 🔒 **All forks and modifications MUST remain open source**
- 🔒 **If you run this as a network service, you MUST make the source code available to users**
- ✅ You must include the license and copyright notices
- ⚠️ No warranty provided (use at your own risk)

**Why AGPL-3.0?** This copyleft license ensures that all derivatives and hosted versions of this software remain open source, protecting the freedom of the community.

---

## 🙏 Acknowledgments

- Built on [TON Blockchain](https://ton.org/)
- Powered by [Next.js](https://nextjs.org/)
- Database by [Neon](https://neon.tech/)
- UI components inspired by the Web3 community
- Special thanks to all contributors

---

## 📧 Support

### Get Help

- **Documentation:** You're reading it! Also check `env.example` and inline code comments
- **Issues:** Open an issue on GitHub for bugs or feature requests
- **Discussions:** Use GitHub Discussions for questions
- **Email:** [support@marka-proof.org] (if available)

### Community

- **GitHub:** Star the repo if you find it useful!
- **Twitter/X:** [@markaproof] (if available)
- **Telegram:** [t.me/markaproof] (if available)

---

## 🚀 Roadmap

Future improvements we're considering:

- [ ] Bulk upload support
- [ ] Subscription pricing model
- [ ] More blockchain support (Ethereum, Solana)
- [ ] Mobile app (React Native)
- [ ] Browser extension for quick verification
- [ ] Advanced analytics for creators
- [ ] API for third-party integrations
- [ ] Decentralized storage integration (IPFS)

Want to help? Check the issues page or submit a PR!

---

## 📊 Status

- **Status:** Production Ready ✅
- **Version:** 1.0.0
- **Last Updated:** October 2025
- **Production URL:** [https://marka-proof.org](https://marka-proof.org)

---

<div align="center">

**Built with ❤️ for the creator economy**

**Trust the blockchain, not us.**

[Website](https://marka-proof.org) • [GitHub](https://github.com/yourusername/marka) • [License](LICENSE)

</div>
