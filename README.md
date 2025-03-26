# Solana HHI Calculator

A dApp to calculate the Herfindahl-Hirschman Index (HHI) for token distribution on the Solana blockchain.

## Overview

This application provides a way to measure token concentration by calculating the Herfindahl-Hirschman Index, which is a common economic measure used to determine market concentration. Higher HHI values indicate higher concentration (less distributed ownership).

The app uses Helius API to fetch token balances and provide accurate HHI calculations.

## Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- SOLID Architecture

### Frontend
- React
- TypeScript
- Tailwind CSS
- Recharts (for visualization)

### API Provider
- Helius (https://www.helius.xyz/)

## Setup and Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```
cd solana-hhi-calculator/backend
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the backend directory with:
```
PORT=3001
HELIUS_API_KEY=your_helius_api_key
CORS_ORIGIN=http://localhost:3000
```

4. Start the development server:
```
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```
cd solana-hhi-calculator/frontend
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

## Features

- Calculate HHI for any Solana token by providing the mint address
- Visualize token holder distribution with an interactive pie chart
- See concentration level categorization (Low, Moderate, High)
- View total supply and holder count statistics

## API Endpoints

- `GET /api/hhi?mint={mint}` - Get HHI calculation for a token

## Architecture

The application follows SOLID principles:

- **S**ingle Responsibility: Each class has one job
- **O**pen/Closed: Code is open for extension but closed for modification
- **L**iskov Substitution: Service implementations are interchangeable
- **I**nterface Segregation: Service interfaces are focused and specific
- **D**ependency Inversion: Dependencies are injected, not hard-coded

## HHI Calculation

HHI is calculated using the formula:

```
HHI = ∑(market share percentage^2) * 10000
```

Where market share is calculated as:

```
Market Share = (holder's balance / total supply)
```

## License

MIT