# 🔍 Casebook — Cryptographic AI Detective Game

**Casebook** is a Web3-native, decentralized Cluedo-style murder mystery simulation running entirely on the **Arkiv Braga Testnet** and powered by the **0G Intelligence Service**. 

Five autonomous AI detectives (Apex, Rogue, Kestrel, Iris, and Vector) navigate Aether Manor, gather clues, and logically rule out suspects, rooms, and weapons. Because all data lives on a public, tamper-proof layer, Casebook employs **hybrid client-side cryptography** to implement secure zero-knowledge gameplay mechanics on-chain.

---

## 🛡️ Track Alignment (AI + Privacy Hybrid)

This project is built for the **ETHNS Arkiv Challenge**, mixing two major tracks:

*   **AI Track:** All detective agents act autonomously. At the start of each turn and when making suggestions, they compile their local hands and deduction notebooks, querying the **0G Intelligence completions router** to generate rich, context-aware monologues matching their unique persona.
*   **Privacy Track:** Since Arkiv is a public database, raw clues cannot be posted in plain text. Casebook generates secure **asymmetric RSA keypairs** for each AI agent upon initialization. The murder secrets (envelope) and private card decks are encrypted locally before being published to Arkiv. Only the designated agent can decrypt these clues at runtime to update their local deduction state.

---

## 🏗️ Technical Architecture & Arkiv Integration

Casebook strictly implements the core architectural patterns of the Arkiv SDK:

### 1. Unique Partitioning
Every read, write, and query is bound to a single project attribute:
```typescript
export const PROJECT_ATTRIBUTE = {
  key: "project",
  value: process.env.NEXT_PUBLIC_PROJECT_ID || "arkiv-casebook-mystery-2026",
};
```

### 2. Multi-Entity System (4 Entity Types)
*   **`game_session`:** Manages the game status, player list, public keys, and the encrypted core murder envelope.
*   **`clue_entity`:** Holds the encrypted private card decks distributed to each player.
*   **`turn_log`:** Commits public turn metrics (dice roll results and active player).
*   **`suggestion`:** Tracks players' official suggestions, monologues, and actions.

### 3. Metadata & Relationships
*   **Tamper-Proof Creator:** All transactions are attributable to the host's wallet client, establishing verified, immutable creator attribution (`$creator`).
*   **Cross-Entity Relations:** Entities are dynamically linked together by querying using the unique parent entity key (`gameId` and `turnNumber`) as query filters:
    ```typescript
    const queryResult = await publicClient
      .buildQuery()
      .where(eq("project", PROJECT_ATTRIBUTE.value))
      .where(eq("gameId", activeGameId))
      .fetch();
    ```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
Ensure you have Node.js (v18.x or v20.x) installed. We recommend building and running inside a **WSL (Ubuntu)** or Linux-based shell.

### 2. Clone & Install
```bash
# Install self-contained dependencies (including @arkiv-network/sdk)
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root folder of the project (use `.env.example` as a template):
```env
# The pre-funded Braga developer private key for transaction signing
NEXT_PUBLIC_DEFAULT_PRIVATE_KEY=0xabcd

# Optional: Override the unique Project Attribute used to identify your entities on-chain
NEXT_PUBLIC_PROJECT_ID=arkiv-casebook-mystery-2026

# The API key used to authenticate with 0G serving completions
ZERO_G_ROUTER_API_KEY=your-0g-api-key-here

# The OpenAI-compatible completions router endpoint URL (defaults to Integrate testnet)
ZERO_G_ROUTER_BASE_URL=https://router-api-testnet.integratenetwork.work/v1

# The serving completions model id
ZERO_G_ROUTER_MODEL=qwen/qwen-2.5-7b-instruct

# Public node RPC url for chain analytics
ZERO_G_RPC_URL=https://evmrpc-testnet.0g.ai
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view your simulation dashboard.
