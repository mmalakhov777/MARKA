import { z } from "zod";

export const hashResponseSchema = z.object({
  id: z.string(),
  hash: z.string(),
  tonscanUrl: z.string().url().nullable(),
  createdAt: z.string(),
  tonTransactionHash: z.string().nullable().optional(),
  tonTransactionLt: z.string().nullable().optional(),
  status: z.enum(["pending", "confirmed", "verified", "failed"]),
  errorMessage: z.string().nullable().optional(),
  lastCheckedAt: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
  fileType: z.string().nullable().optional(),
  userId: z.string().nullable().optional(), // UUID from users_v2 table
  walletAddress: z.string().nullable().optional(), // TON wallet address
});

export type HashResponse = z.infer<typeof hashResponseSchema>;

