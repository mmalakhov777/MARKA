import "server-only";

import { type HashResponse } from "@/lib/validation";

const globalForProofStore = globalThis as typeof globalThis & {
  __proofStore?: Map<string, HashResponse>;
};

const proofStore = globalForProofStore.__proofStore ?? new Map<string, HashResponse>();

if (!globalForProofStore.__proofStore) {
  globalForProofStore.__proofStore = proofStore;
}

export function saveProof(proof: HashResponse) {
  proofStore.set(proof.id, proof);
}

export function getProofById(id: string) {
  return proofStore.get(id) ?? null;
}

export function getProofStoreSnapshot() {
  return Array.from(proofStore.entries()).map(([id, proof]) => ({
    id,
    hash: proof.hash,
    tonscanUrl: proof.tonscanUrl,
    createdAt: proof.createdAt,
    status: proof.status,
  }));
}

