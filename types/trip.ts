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
