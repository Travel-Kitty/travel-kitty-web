export type OcrItem = {
  name: string;
  qty?: number | null;
  price?: number | null;
};

export type OcrResult = {
  total?: number;
  currency?: string;
  merchant?: string | null;
  items?: OcrItem[] | [];
  note?: string | null;
};
