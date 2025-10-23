export type TripRow = {
  id: string;
  name: string;
  code6: string;
  creator: string;
  tripAddress: string;
  createTxHash: string;
  chainId: number;
  joined: boolean;
  mine: boolean;
};

export type CreateTripInput = {
  name: string;
  code6: string;
  creator: string; // wallet (0x...)
  tripAddress: string; // (0x...)
  createTxHash?: string | null;
  chainId?: number;
};

export type TripDetail = {
  id: string;
  name: string;
  code6: string;
  creator: string;
  tripAddress: string;
  createTxHash: string;
  chainId: number;
  createdAt: string;
  latestReceipt: null | {
    currency: string;
    items: unknown;
    total: number | null;
    imageUrl?: string | null;
    createdAt: string;
  };
};
