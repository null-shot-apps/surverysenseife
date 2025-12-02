# Survey App with Thirdweb Integration

A React application built with Next.js that allows users to create surveys using AI and lock funds on the blockchain via Thirdweb SDK v5.

## Features

- **Wallet Connection**: Multiple wallet support including MetaMask, Coinbase, Rainbow, Rabby, and Zerion
- **Embedded Wallet**: Google and email authentication via Thirdweb embedded wallet
- **AI Integration**: Generates survey parameters via API call
- **Blockchain Integration**: Creates surveys on-chain with fund locking on BSC
- **Modern UI**: Clean interface built with Tailwind CSS

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root and add your Thirdweb client ID:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_actual_thirdweb_client_id_here
```

### 2. Smart Contract Configuration

Update the contract address in `src/app/page.tsx`:

```javascript
const SURVEY_CONTRACT_ADDRESS = "0xYourActualSurveyRewardsAddress";
```

### 3. Smart Contract ABI

The application expects a smart contract with the following function:

```solidity
function createSurveyOnChain(
    string _surveyId,
    address _creator,
    uint256 _totalReward,
    uint256 _targetResponses
) external payable
```

If you need to update the ABI, modify the `prepareContractCall` method parameter in the `handleCreateSurvey` function.

## How It Works

### 1. Wallet Connection
Users connect their wallet using the Thirdweb ConnectButton with support for:
- Embedded wallet (Google/Email auth)
- MetaMask
- Coinbase Wallet
- Rainbow
- Rabby
- Zerion

### 2. Survey Creation Flow

1. **Input**: User describes their survey (e.g., "Make a survey about hoodies preferences")
2. **AI Processing**: API call to `https://surveysensei-agent.rahmandana08.workers.dev/agent/create`
3. **Response**: AI returns survey parameters including:
   - `surveyId`: Unique identifier
   - `totalReward`: Amount in BNB to lock
   - `targetResponses`: Expected number of responses
4. **Blockchain Transaction**: Creates survey on-chain with locked funds

### 3. API Integration

The app sends a POST request with the format:
```json
{
  "content": "USER_INPUT + Wallet saya: USER_WALLET_ADDRESS"
}
```

Expected response:
```json
{
  "survey": {
    "surveyId": "unique_id",
    "totalReward": "0.1",
    "targetResponses": 100
  }
}
```

## Technical Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4
- **Blockchain**: Thirdweb SDK v5
- **Chain**: Binance Smart Chain (BSC)
- **TypeScript**: Full type safety

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Lint code
pnpm lint
```

## Key Components

- `src/app/page.tsx`: Main survey creation interface
- `src/lib/thirdweb.ts`: Thirdweb client and wallet configuration
- `src/app/layout.tsx`: Root layout with ThirdwebProvider

## Error Handling

The application includes comprehensive error handling for:
- API failures
- Transaction failures
- Wallet connection issues
- Invalid input validation

## Security Considerations

- Environment variables are properly configured for client-side usage
- Transaction values are converted to Wei for precision
- Input validation prevents empty submissions
- Error messages don't expose sensitive information
