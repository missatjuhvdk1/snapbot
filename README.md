# Snapchat Video Posting Automation Platform

Automate video posting to multiple Snapchat accounts with proxy support, captcha handling, and human-like behavior simulation.

## 🚀 Features

- **Multi-Account Management**: Manage 10-150 Snapchat accounts
- **Proxy Support**: One proxy per account for IP isolation
- **Job Queue**: BullMQ-based reliable job processing
- **Session Persistence**: Reuse login sessions to avoid repeated logins
- **Anti-Detection**: Stealth plugin, random delays, viewport randomization
- **Web Dashboard**: User-friendly interface (coming soon)

## 📋 Prerequisites

- **Node.js** 18+
- **pnpm** 8+
- **Docker** & Docker Compose (for PostgreSQL and Redis)

## 🛠️ Setup Instructions

### 🚀 Automated Setup (Recommended)

**One command to get started:**

```bash
npm run setup
```

This automatically:
- ✅ Installs pnpm if needed
- ✅ Verifies Docker installation
- ✅ Creates .env file from template
- ✅ Starts PostgreSQL and Redis containers
- ✅ Installs all dependencies
- ✅ Generates Prisma client
- ✅ Runs database migrations

After setup completes:
```bash
pnpm dev        # Run all services
# OR
pnpm dev:api    # API server on http://localhost:3000
pnpm dev:worker # Background worker
```

### ⚙️ Manual Setup (Alternative)

<details>
<summary>Click to expand manual setup steps</summary>

#### 1. Install Dependencies

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install all dependencies
pnpm install

# Install Playwright browsers
cd apps/worker
pnpm exec playwright install chromium
cd ../..
```

#### 2. Start Database Services

```bash
# Start PostgreSQL and Redis via Docker Compose
pnpm docker:up

# Check if services are running
docker ps
```

#### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and update values:
# - JWT_SECRET (generate a strong random string)
# - ENCRYPTION_KEY (generate a 32+ character string)
# - Other settings as needed
```

#### 4. Setup Database

```bash
# Run Prisma migrations
pnpm db:migrate

# (Optional) Open Prisma Studio to view database
pnpm db:studio
```

#### 5. Start the Applications

```bash
# Start API server (Terminal 1)
pnpm dev:api

# Start Worker (Terminal 2)
pnpm dev:worker

# The API will be available at http://localhost:3000
```

</details>

## 📁 Project Structure

```
snapchat-automation/
├── apps/
│   ├── api/              # NestJS API Server
│   │   ├── src/
│   │   │   ├── modules/  # API modules (auth, accounts, videos, jobs)
│   │   │   └── prisma/   # Prisma service
│   │   └── prisma/
│   │       └── schema.prisma   # Database schema
│   │
│   ├── worker/           # BullMQ Worker (automation engine)
│   │   └── src/
│   │       ├── automation/
│   │       │   ├── browser-manager.ts  # Playwright context management
│   │       │   └── snapchat-bot.ts     # Snapchat automation logic
│   │       └── processors/
│   │           └── post-video.processor.ts
│   │
│   └── web/              # React Dashboard (TODO)
│
├── docker-compose.yml    # PostgreSQL + Redis
└── package.json          # Root workspace config
```

## 🎯 Current Status

### ✅ Completed (Phase 1)
- [x] Monorepo structure (PNPM workspaces + Turbo)
- [x] Docker Compose (PostgreSQL + Redis)
- [x] Prisma database schema
- [x] NestJS API structure
- [x] BullMQ worker setup
- [x] Browser manager (Playwright with stealth)
- [x] Snapchat bot (login & video posting)
- [x] Job processor

### 🚧 Next Steps (Phase 2)
- [ ] Test Snapchat login flow with real account
- [ ] Update selectors (Snapchat's UI changes frequently)
- [ ] Implement Accounts API (CRUD, encryption)
- [ ] Implement Videos API (upload, storage)
- [ ] Implement Jobs API (create, list, retry)
- [ ] Add proxy encryption/decryption
- [ ] Session management improvements

### 📋 Backlog (Phase 3+)
- [ ] Captcha detection & 2Captcha integration
- [ ] React web dashboard
- [ ] Real-time WebSocket updates
- [ ] Analytics dashboard
- [ ] Account warmup automation

## 🔧 API Endpoints (Planned)

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Accounts
- `GET /accounts` - List Snapchat accounts
- `POST /accounts` - Add new Snapchat account
- `PATCH /accounts/:id` - Update account
- `DELETE /accounts/:id` - Delete account

### Videos
- `POST /videos/upload` - Upload video file
- `GET /videos` - List videos
- `DELETE /videos/:id` - Delete video

### Jobs
- `POST /jobs` - Create posting job
- `GET /jobs` - List jobs
- `GET /jobs/:id` - Get job details
- `POST /jobs/:id/retry` - Retry failed job

### Proxies
- `GET /proxies` - List proxies
- `POST /proxies` - Add proxy
- `DELETE /proxies/:id` - Delete proxy

## 🧪 Testing the Automation

### Manual Test Flow

1. **Add a Snapchat account to the database**:
```sql
INSERT INTO accounts (id, user_id, username, password, status)
VALUES (
  'test-account-id',
  'your-user-id',
  'your_snapchat_username',
  'encrypted_password',
  'ACTIVE'
);
```

2. **Upload a video** (manually place in `uploads/` directory)

3. **Create a job** via API or database:
```sql
INSERT INTO jobs (id, account_id, video_id, status)
VALUES ('test-job-id', 'test-account-id', 'video-id', 'PENDING');
```

4. **Watch the worker logs** to see the automation in action

## ⚠️ Important Notes

### Snapchat Selectors
The selectors in `snapchat-bot.ts` are **placeholders** and will need to be updated:
- Snapchat's web interface changes frequently
- You'll need to inspect their current HTML structure
- Use browser DevTools to find correct selectors
- Consider using more stable selectors (data attributes, ARIA labels)

### Bot Detection Risks
- Snapchat has aggressive bot detection
- Use proxies to avoid IP bans
- Implement realistic delays (2-8 seconds)
- Don't post too frequently (max 3 per day recommended)
- Warmup new accounts gradually (14-day warmup period)

### Account Security
- Passwords are encrypted with AES-256
- Use strong ENCRYPTION_KEY in production
- Never commit .env file to version control
- Use HTTPS in production

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs snapchat-automation-postgres
```

### Playwright Issues
```bash
# Reinstall browsers
cd apps/worker
pnpm exec playwright install chromium --force
```

### Worker Not Processing Jobs
```bash
# Check Redis connection
docker logs snapchat-automation-redis

# Verify worker is running
# Check terminal logs for errors
```

## 📚 Development Commands

```bash
# Install dependencies
pnpm install

# Start services
pnpm docker:up

# Run database migrations
pnpm db:migrate

# Start API in dev mode
pnpm dev:api

# Start Worker in dev mode
pnpm dev:worker

# Build all apps
pnpm build

# View database
pnpm db:studio
```

## 🔐 Security Disclaimer

**Important**: This platform automates interactions with Snapchat, which may violate their Terms of Service. Use at your own risk. The developers are not responsible for:
- Account bans or suspensions
- Legal issues related to automation
- Misuse of the platform

This is intended for **educational and personal use only**.

## 📄 License

MIT License - Use at your own risk

---

**Need Help?** Check the plan file or create an issue.
