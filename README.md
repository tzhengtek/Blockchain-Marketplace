# Blockchain Project - Tokenized Asset Management Platform

A complete blockchain-based asset management platform featuring KYC-enabled NFTs and ERC20 tokens on BSC Testnet. This full-stack application includes smart contracts, a blockchain indexer, REST API backend, and modern Next.js frontend.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture & Design Choices](#architecture--design-choices)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Smart Contracts](#smart-contracts)

## 🎯 Overview

This platform is a decentralized solution for tokenizing real-world assets with built-in compliance. The platform enables:

- **KYC-Gated Transfers**: Only verified users can send/receive tokens and NFTs
- **Asset Tokenization**: Real-world assets represented as NFTs
- **Utility Token**: Platform ERC20 token with DEX integration
- **NFT Marketplace**: Buy and sell tokenized assets with platform fees
- **Blockchain Indexer**: Real-time event monitoring and database synchronization
- **REST API**: Query transactions, NFTs, and KYC status
- **Modern Frontend**: Web3-enabled UI with wallet integration

## 🏗️ Architecture & Design Choices

### Multi-Service Architecture

The platform is designed as a microservices-based system with clear separation of concerns:

```
┌─────────────────┐
│   Frontend      │  (Next.js on Vercel)
│   (Next.js)     │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend API   │  (Rust/Axum via ngrok)
│   (Rust/Axum)   │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
┌───▼───┐ ┌──▼──────┐ ┌────▼──────┐
│  DB   │ │ Indexer │ │ Contracts │
│ (PG)  │ │ (Rust)  │ │ (Solidity)│
└───────┘ └────┬────┘ └───────────┘
               │
          ┌────▼────┐
          │ BSC RPC │
          │(WebSocket)
          └─────────┘
```

### Design Decisions

#### 1. **Why Rust for Backend & Indexer?**

**The Problem**: Blockchain indexers need to process thousands of events per second while maintaining data consistency. Traditional languages like Python or JavaScript struggle with performance and memory safety in high-throughput scenarios.

**Our Solution**: We chose Rust for both the backend API and blockchain indexer for several critical reasons:

- **Performance**: Rust provides zero-cost abstractions and compiles to native code, making it as fast as C/C++ but with modern language features. When indexing blockchain events, we can process blocks in real-time without falling behind.

- **Memory Safety**: Financial applications cannot afford memory leaks or race conditions. Rust's ownership system catches these bugs at compile time, not in production. No garbage collector means predictable latency.

- **Async Concurrency**: The Tokio runtime allows us to handle thousands of concurrent WebSocket connections, database queries, and HTTP requests efficiently on minimal hardware.

- **Type Safety for Blockchain**: Ethereum addresses, uint256 values, and transaction hashes have specific formats. Rust's type system (via Alloy) ensures we never mix up an address with a transaction hash or overflow a number.

**Trade-offs**: Rust has a steeper learning curve than Node.js or Python. However, for a financial platform handling real money, the safety guarantees are worth the initial investment.

#### 2. **Why PostgreSQL Instead of NoSQL?**

**The Problem**: Blockchain data has complex relationships (transactions belong to blocks, NFTs have owners, marketplace listings reference NFTs). We also need transactional guarantees when updating multiple tables.

**Our Solution**: PostgreSQL was chosen over MongoDB, Redis, or other NoSQL databases:

- **ACID Transactions**: When a user lists an NFT for sale, we need to atomically update both the NFT ownership table and marketplace listings table. PostgreSQL ensures these happen together or not at all—critical for financial integrity.

- **Complex Queries**: Our API supports filtering transactions by multiple criteria (from address, to address, contract, date range) with pagination. PostgreSQL's query optimizer handles these efficiently with proper indexes.

- **Data Integrity**: Foreign key constraints ensure we never have orphaned records (e.g., a marketplace listing for a non-existent NFT).

- **JSON Support**: While primarily relational, PostgreSQL also supports JSONB columns for flexible metadata storage (NFT properties, transaction logs).

- **Type-Safe Queries**: Using SQLx, our SQL queries are checked at compile time against the actual database schema, preventing runtime SQL errors.

**Trade-offs**: PostgreSQL requires more setup than a document database, but our data is inherently relational, making it the natural fit.

#### 3. **Why Separate the Indexer from the Backend?**

**The Problem**: A blockchain indexer needs to continuously listen to events 24/7. If we combined it with the API server, a crash in the indexer would take down the API, and restarting the API would interrupt blockchain syncing.

**Our Solution**: We architected the system with three separate processes:

1. **Indexer** (reads blockchain → writes database)
2. **Backend API** (reads database → serves frontend)
3. **Database** (single source of truth)

**Benefits**:

- **Independent Scaling**: If API traffic increases, we scale backend instances. If blockchain throughput increases, we scale indexers independently.

- **Fault Isolation**: A bug in the indexer doesn't crash the API. Users can still query existing data while we debug indexer issues.

- **Different Resource Needs**: The indexer needs persistent WebSocket connections and high network bandwidth. The API needs CPU for request handling. They can run on different hardware.

- **Simplified Deployment**: We can restart the API (for updates) without interrupting blockchain indexing, and vice versa.

- **Multiple Indexers**: We can run separate indexers for different contracts (NFT, Token, Marketplace) that all write to the same database.

**Trade-offs**: More moving parts means more operational complexity. However, the reliability and scalability gains justify this for a production system.

#### 4. **Why REST API Instead of GraphQL?**

**The Problem**: The frontend needs to query transactions, NFTs, and KYC status. We could use REST, GraphQL, or even gRPC.

**Our Solution**: A REST API with OpenAPI documentation:

- **Simplicity**: REST endpoints are straightforward—`GET /api/transaction` returns transactions. No schema definition language to learn.

- **Caching**: HTTP caching works naturally with REST. `GET` requests can be cached by browsers, CDNs, and reverse proxies.

- **Tooling**: REST has universal support—curl for testing, Postman for exploring, axios/fetch for frontend consumption.

- **Auto-Generated Docs**: Using utoipa, we generate interactive Swagger UI documentation from our Rust code. Developers can test endpoints directly in the browser.

- **CORS Configured**: Cross-origin requests work out of the box, allowing the frontend deployed on Vercel to call the backend on ngrok.

**Trade-offs**: GraphQL would allow clients to request exactly the data they need. However, our API surface is small and well-defined, so REST's simplicity wins.

#### 5. **Why Next.js for the Frontend?**

**The Problem**: Building a Web3 application requires wallet integration, smart contract interaction, and a responsive UI. We need both good developer experience and excellent user experience.

**Our Solution**: Next.js 15 with the App Router provides:

- **React Server Components**: We can fetch blockchain data on the server, reducing JavaScript sent to the browser and improving initial page load.

- **Type Safety**: TypeScript throughout the stack—from API responses (matching our backend types) to smart contract ABIs (via Wagmi).

- **Wagmi & Viem**: These libraries provide React hooks for reading contracts, sending transactions, and managing wallet connections. All fully typed.

- **WalletConnect Integration**: Users can connect with MetaMask, Trust Wallet, Coinbase Wallet, or any WalletConnect-compatible wallet.

- **Modern UI Components**: Tailwind CSS for styling and shadcn/ui for pre-built accessible components (dialogs, dropdowns, forms) saves development time.

- **Deployment**: Vercel (created by Next.js authors) provides zero-config deployment, automatic HTTPS, and global CDN.

**Trade-offs**: Next.js has a learning curve with its server/client component model. However, the performance and developer experience benefits are substantial.

#### 6. **Why Foundry Instead of Hardhat?**

**The Problem**: Smart contract development requires compiling Solidity, running tests, deploying to networks, and verifying on block explorers.

**Our Solution**: Foundry (Forge, Cast, Anvil) written in Rust:

- **Speed**: Forge compiles and tests contracts 10-100x faster than Hardhat. Our test suite runs in seconds, not minutes, enabling rapid iteration.

- **Solidity Tests**: We write tests in Solidity (not JavaScript), using the same language as our contracts. This feels more natural and catches more bugs.

- **Gas Reports**: Foundry shows exact gas costs for each function in tests, helping us optimize expensive operations.

- **Script-Based Deployment**: Deployment scripts are Solidity, not JavaScript. They're type-checked and can reuse contract code.

- **Built-in Fuzz Testing**: Foundry automatically generates random inputs to find edge cases we didn't think to test.

- **Cast CLI**: Command-line tools for calling contracts, converting units (wei to ether), and encoding calldata.

**Trade-offs**: Fewer plugins and smaller ecosystem compared to Hardhat. However, for our needs (deploy, test, verify), Foundry's speed and Solidity-native approach is superior.

#### 7. **Why Deploy Frontend on Vercel and Backend on ngrok?**

**The Problem**: We need to deploy a full-stack application with minimal infrastructure management.

**Our Solution**: 

**Vercel for Frontend**:
- **Zero Configuration**: Push to GitHub, Vercel automatically builds and deploys Next.js
- **Global CDN**: Frontend assets served from edge locations worldwide
- **Automatic HTTPS**: Free SSL certificates
- **Preview Deployments**: Every PR gets its own URL for testing
- **Free Tier**: Generous limits for hobby projects

**ngrok for Backend**:
- **No Server Setup**: Expose localhost to internet with one command
- **Automatic HTTPS**: Secure tunnel without certificate management
- **Quick Iteration**: Change code, restart server, same URL (with paid tier)
- **Perfect for MVP**: Get to market fast without infrastructure overhead

**Trade-offs**: 
- ngrok free tier gives you a new URL each restart (paid tier solves this)
- Not suitable for high-traffic production without upgrading
- For serious production, migrate backend to Railway, Fly.io, or AWS

**Why This Approach Works**:
- **Separation of Concerns**: Static frontend on CDN, dynamic backend on dedicated server
- **Development Speed**: Deploy in minutes, not days
- **Cost Effective**: Both have free tiers adequate for testing and MVP
- **Migration Path**: Easy to move backend to dedicated infrastructure later without changing frontend code

## 🛠️ Technology Stack

### Backend
- **Rust 1.90+** - Systems programming language
- **Axum** - Modern web framework with Tower middleware
- **SQLx** - Async SQL toolkit with compile-time query verification
- **Tokio** - Async runtime
- **Alloy** - High-performance Ethereum library
- **Tracing** - Structured logging

### Database
- **PostgreSQL 14+** - Relational database
- **SQLx Migrations** - Schema versioning

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Wagmi** - React Hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- **Reown AppKit** - Wallet connection UI
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Re-usable component library

### Smart Contracts
- **Solidity** - Smart contract language
- **Foundry** - Development toolkit (Forge, Cast, Anvil)
- **OpenZeppelin** - Audited contract libraries
- **PancakeSwap V2** - DEX integration

### Infrastructure
- **Docker** - Containerization
- **Vercel** - Frontend hosting
- **ngrok** - Backend tunneling
- **BSC Testnet** - Blockchain network

## 📦 Prerequisites

### Required Tools
- **Rust** (1.90+): [Install](https://rustup.rs/)
- **Node.js** (20+): [Install](https://nodejs.org/)
- **PostgreSQL** (14+): [Install](https://www.postgresql.org/download/)
- **Foundry**: [Install](https://book.getfoundry.sh/getting-started/installation)
- **ngrok**: [Install](https://ngrok.com/download)
- **Vercel CLI** (optional): `npm i -g vercel`

### Required Accounts
- **BSC Testnet Wallet** with tBNB ([Faucet](https://testnet.bnbchain.org/faucet-smart))
- **Vercel Account** (free tier works)
- **ngrok Account** (free tier works)

## 📁 Project Structure

```
blockchain/
├── backend/                  # REST API server (Rust/Axum)
│   ├── src/
│   │   └── main.rs          # API routes, handlers
│   └── Cargo.toml
│
├── indexer/                  # Blockchain event indexer (Rust)
│   ├── src/
│   │   ├── main.rs          # Indexer entry point
│   │   ├── blockchain/      # Web3 provider, event listening
│   │   └── config/          # Settings, contract addresses
│   └── examples/abi/        # Smart contract ABIs
│
├── database/                 # Database models & migrations
│   ├── migrations/          # SQL migration files
│   └── src/
│       └── database.rs      # Query functions, models
│
├── frontend/                 # Next.js application (alternative)
│   └── src/
│       ├── app/             # Pages & layouts
│       ├── components/      # React components
│       └── utils/wagmi/     # Blockchain config
│
├── nextjs/                   # Next.js application (main)
│   └── src/
│       ├── app/             # App router pages
│       ├── components/      # UI components
│       ├── contracts/       # Contract ABIs & addresses
│       ├── hooks/           # Custom React hooks
│       └── utils/           # Helper functions
│
├── tokenized-asset-management-platform/  # Smart contracts
│   ├── src/                 # Solidity contracts
│   │   ├── AssetNFT.sol    # NFT contract
│   │   ├── AssetToken.sol  # ERC20 token
│   │   ├── KYCRegistry.sol # KYC management
│   │   ├── AssetMarketplace.sol
│   │   └── NFTPriceOracle.sol
│   ├── script/              # Deployment scripts
│   └── test/                # Contract tests
│
├── Dockerfile.backend        # Backend container
├── Dockerfile.indexer        # Indexer container
├── Cargo.toml               # Rust workspace config
└── .env                     # Environment variables
```

## 🚀 Setup & Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd blockchain
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgres://username:password@localhost:5432/blockchain_db

# Blockchain
BLOCKCHAIN__WS_URL=wss://bsc-testnet-rpc.publicnode.com
WALLET_PRIVATE_KEY=your_wallet_private_key_here

# Backend
PORT=8080
RUST_LOG=info,backend=debug,indexer=debug

# Contract Addresses (BSC Testnet)
CONTRACT__NFT_ADDRESS=0x5d44D4D77FFc1eb62bcC361F0FA96122620F03B8
CONTRACT__TOKEN_ADDRESS=0x9754547A1315C041ABE4682D9301EEbF591C7cB3
CONTRACT__KYC_ADDRESS=0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe
CONTRACT__MARKET_ADDRESS=0x5E801F0D03675912D0C123eAeE28f428EE7aace6
CONTRACT__ORACLE_ADDRESS=0xf39472BCBECcACB22256424F96Ef0151a0b5c8d5
```

### 3. Database Setup

```bash
# Create database
createdb blockchain_db

# Run migrations
cd database
cargo install sqlx-cli --no-default-features --features postgres
sqlx migrate run
```

### 4. Build Rust Components

```bash
# Build all Rust crates
cargo build --release

# Or build individually
cargo build -p backend --release
cargo build -p indexer --release
```

### 5. Install Frontend Dependencies

```bash
# For main Next.js app
cd nextjs
npm install

# Or if using frontend/ directory
cd frontend
npm install
```

### 6. Smart Contracts (Optional - Already Deployed)

If you need to deploy your own contracts:

```bash
cd tokenized-asset-management-platform

# Install dependencies
forge install

# Run tests
forge test

# Deploy (see DEPLOYMENT_BSC.md for details)
forge script script/Deploy.s.sol --rpc-url bsc-testnet --broadcast
```

## 🌐 Deployment

### Frontend Deployment (Vercel)

#### Option 1: Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Set **Root Directory** to `nextjs` or `frontend`
   - Add environment variables:
     ```
     NEXT_PUBLIC_BACKEND_API=https://your-ngrok-url.ngrok-free.app/api
     NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
     ```
   - Click **Deploy**

#### Option 2: Vercel CLI

```bash
cd nextjs

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Backend Deployment (ngrok)

#### 1. Start the Backend Locally

```bash
# Start backend API
cargo run -p backend --release

# Or using Docker
docker build -t blockchain-backend -f Dockerfile.backend .
docker run -p 8080:8080 --env-file .env blockchain-backend
```

#### 2. Start the Indexer

```bash
# In a separate terminal
cargo run -p indexer --release

# Or using Docker
docker build -t blockchain-indexer -f Dockerfile.indexer .
docker run --env-file .env blockchain-indexer
```

#### 3. Expose Backend with ngrok

```bash
# Basic tunnel (free tier)
ngrok http 8080

# With custom domain (paid tier)
ngrok http 8080 --domain=your-subdomain.ngrok-free.app
```

**ngrok will provide a URL like:**
```
https://abc123.ngrok-free.app -> http://localhost:8080
```

#### 4. Update Frontend Environment Variable

Update your Vercel environment variables with the ngrok URL:
```
NEXT_PUBLIC_BACKEND_API=https://abc123.ngrok-free.app/api
```

Redeploy the frontend for changes to take effect.

### Production Considerations

#### Using ngrok for Production
- **Pros**: Easy setup, automatic HTTPS, no server configuration
- **Cons**: URL changes on restart (unless paid tier), limited bandwidth
- **Recommended**: Use ngrok paid tier for stable domain

#### Alternative Backend Deployment
For long-term production, consider:
- **Railway**: Easy Rust deployment with persistent URLs
- **Fly.io**: Global distribution, Rust-friendly
- **DigitalOcean App Platform**: Managed containers
- **AWS ECS / Cloud Run**: Full control, scalable

Example Railway deployment:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 📚 API Documentation

### Swagger UI
Once the backend is running, visit:
```
http://localhost:8080/swagger-ui
```

### Endpoints

#### KYC Management

**Check KYC Status**
```http
GET /api/kyc?wallet_address=0x...
Response: boolean
```

**Add Wallet to KYC**
```http
POST /api/kyc
Content-Type: application/json

{
  "wallet_address": "0x..."
}
```

**Remove from KYC**
```http
DELETE /api/kyc?wallet_address=0x...
```

#### Transactions

**Query Transactions**
```http
GET /api/transaction?limit=50&pagination=1&contract_address=0x...&from=0x...&to=0x...

Response:
{
  "total": 150,
  "transactions": [
    {
      "transaction_hash": "0x...",
      "from_address": "0x...",
      "to_address": "0x...",
      "value": "1000000000000000000",
      "timestamp": "2025-10-25T12:00:00Z",
      "block_id": 12345,
      "contract_address": "0x..."
    }
  ]
}
```

#### NFTs

**Get NFTs**
```http
GET /api/nft?owner=0x...&limit=50&pagination=1

Response:
{
  "total": 5,
  "nfts": [
    {
      "owner": "0x...",
      "token_id": 1,
      "contract_address": "0x..."
    }
  ]
}
```

**Update NFT Price (Oracle)**
```http
POST /api/nft
Content-Type: application/json

{
  "contract_address": "0x...",
  "token_id": 1,
  "price": 1000000000000000000
}
```

#### Marketplace

**Get Listed NFTs**
```http
GET /api/nft-listed

Response: [
  {
    "seller": "0x...",
    "token_id": 1,
    "nft_contract": "0x...",
    "price": 1000000000000000000
  }
]
```

## ⚙️ Configuration

### Indexer Configuration

Edit `indexer/src/config/default.toml`:

```toml
[contract]
nft_address = "0x5d44D4D77FFc1eb62bcC361F0FA96122620F03B8"
token_address = "0x9754547A1315C041ABE4682D9301EEbF591C7cB3"
kyc_address = "0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe"
market_address = "0x5E801F0D03675912D0C123eAeE28f428EE7aace6"
oracle_address = "0xf39472BCBECcACB22256424F96Ef0151a0b5c8d5"
```

Configuration can be overridden via environment variables:
```bash
CONTRACT__NFT_ADDRESS=0x...
CONTRACT__TOKEN_ADDRESS=0x...
```

### Frontend Configuration

Create `nextjs/.env.local`:

```bash
# Backend API (ngrok URL)
NEXT_PUBLIC_BACKEND_API=https://your-backend.ngrok-free.app/api

# WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Blockchain Network
NEXT_PUBLIC_CHAIN_ID=97  # BSC Testnet
```

## 🔧 Development

### Run in Development Mode

**Terminal 1: Database**
```bash
# Ensure PostgreSQL is running
postgres -D /usr/local/var/postgres
```

**Terminal 2: Backend**
```bash
cargo watch -x "run -p backend"
```

**Terminal 3: Indexer**
```bash
cargo watch -x "run -p indexer"
```

**Terminal 4: Frontend**
```bash
cd nextjs
npm run dev
```

**Terminal 5: ngrok (if testing with external services)**
```bash
ngrok http 8080
```

### Testing

**Backend Tests**
```bash
cargo test -p backend
```

**Smart Contract Tests**
```bash
cd tokenized-asset-management-platform
forge test -vvv
```

**Frontend Tests**
```bash
cd nextjs
npm run test
```

### Database Migrations

**Create a new migration:**
```bash
cd database
sqlx migrate add migration_name
```

**Apply migrations:**
```bash
sqlx migrate run
```

**Revert last migration:**
```bash
sqlx migrate revert
```

### Logging

Adjust log levels via `RUST_LOG` environment variable:

```bash
# Debug everything
RUST_LOG=debug

# Debug specific modules
RUST_LOG=backend=debug,indexer=debug,sqlx=warn

# Production
RUST_LOG=info
```

## 🔐 Smart Contracts

### Deployed Contracts (BSC Testnet)

| Contract | Address | Description |
|----------|---------|-------------|
| **KYCRegistry** | `0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe` | Manages KYC whitelist |
| **AssetNFT** | `0x5d44D4D77FFc1eb62bcC361F0FA96122620F03B8` | ERC721 for tokenized assets |
| **AssetToken** | `0x9754547A1315C041ABE4682D9301EEbF591C7cB3` | ERC20 utility token |
| **AssetMarketplace** | `0x5E801F0D03675912D0C123eAeE28f428EE7aace6` | NFT trading platform |
| **NFTPriceOracle** | `0xf39472BCBECcACB22256424F96Ef0151a0b5c8d5` | Price feed for NFTs |
| **PancakeSwap Pair** | `0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7` | BNB/Token liquidity pool |

### Key Features

- **KYC Enforcement**: Transfer restrictions via KYCRegistry hooks
- **Marketplace Fees**: 2.5% platform fee on NFT sales
- **Oracle Integration**: Dynamic pricing for NFTs
- **DEX Integration**: PancakeSwap V2 for token swaps
- **Upgradeable**: Owner-controlled contract updates

For detailed contract documentation, see:
- [Smart Contracts README](./tokenized-asset-management-platform/README.md)
- [Deployment Guide](./tokenized-asset-management-platform/DEPLOYMENT_BSC.md)
- [Scripts Guide](./tokenized-asset-management-platform/SCRIPTS_GUIDE.md)

## 🐛 Troubleshooting

### Backend Issues

**Issue: Database connection failed**
```
Error: Failed to connect to database
```
**Solution**: Verify PostgreSQL is running and DATABASE_URL is correct
```bash
psql $DATABASE_URL
```

**Issue: WebSocket connection failed**
```
Error: Failed to connect to blockchain provider
```
**Solution**: Check BLOCKCHAIN__WS_URL and network connectivity
```bash
wscat -c wss://bsc-testnet-rpc.publicnode.com
```

### Frontend Issues

**Issue: Wallet connection fails**
```
WalletConnect Error: Invalid project ID
```
**Solution**: Get a project ID from https://cloud.walletconnect.com

**Issue: API requests fail with CORS error**
```
Access to fetch at 'http://localhost:8080' has been blocked by CORS policy
```
**Solution**: Backend CORS is configured for `Any` origin. Check ngrok URL is correct.

### Indexer Issues

**Issue: Events not being indexed**
**Solution**: 
1. Verify contract addresses in config
2. Check WALLET_PRIVATE_KEY has permissions
3. Ensure contracts have been deployed
4. Check blockchain connectivity

### ngrok Issues

**Issue: ngrok URL keeps changing**
**Solution**: 
- Use a paid ngrok account for persistent domains
- Or use `ngrok http 8080 --domain=your-domain.ngrok-free.app`

**Issue: "ngrok not found"**
**Solution**: 
```bash
# macOS
brew install ngrok

# Linux
snap install ngrok

# Windows
choco install ngrok
```

## 📖 Additional Documentation

- [Smart Contracts README](./tokenized-asset-management-platform/README.md)
- [Deployment Guide (BSC)](./tokenized-asset-management-platform/DEPLOYMENT_BSC.md)
- [Wagmi Swap Guide](./tokenized-asset-management-platform/WAGMI_SWAP_GUIDE.md)
- [Liquidity Pool Guide](./tokenized-asset-management-platform/LIQUIDITY_POOL_GUIDE.md)
- [Scripts Guide](./tokenized-asset-management-platform/SCRIPTS_GUIDE.md)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenZeppelin**: Secure smart contract libraries
- **Foundry**: Fast Ethereum development toolkit
- **Alloy**: Modern Rust Ethereum library
- **PancakeSwap**: DEX integration
- **Vercel**: Frontend hosting platform
- **ngrok**: Secure tunneling service

---

**Need Help?** Open an issue or reach out to the development team.

**Happy Building! 🚀**

