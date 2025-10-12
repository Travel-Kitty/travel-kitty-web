export const ADDR = {
  TRAVEL_KITTY: process.env.NEXT_PUBLIC_TRAVEL_KITTY as `0x${string}`,
  MOCK_USD: process.env.NEXT_PUBLIC_MOCK_USD as `0x${string}`,
  FAUCET: process.env.NEXT_PUBLIC_FAUCET as `0x${string}`,
};

export const travelKittyAbi = [
  {
    type: "function",
    name: "join",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "addExpense",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountUsdScaled", type: "uint256" },
      { name: "cid", type: "bytes" },
      { name: "splitWith", type: "address[]" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "settleToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "creditor", type: "address" },
      { name: "amountUsdScaled", type: "uint256" },
      { name: "token", type: "address" },
    ],
    outputs: [],
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ type: "address", name: "owner" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const faucetAbi = [
  {
    type: "function",
    name: "claim",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
