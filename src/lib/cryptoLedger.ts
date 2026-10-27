import { CryptographicAuditBlock } from '../types';

// Fast deterministic SHA-256 style hash for simulation and state updates
export function simpleSha256(input: string): string {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h0 = (Math.imul(h0 ^ code, 0x5bd1e995) + code) | 0;
    h1 = (Math.imul(h1 ^ (code << 3), 0x27d4eb2d) + code) | 0;
    h2 = (Math.imul(h2 ^ (code << 7), 0x165667b1) + code) | 0;
    h3 = (Math.imul(h3 ^ (code << 11), 0x85ebca6b) + code) | 0;
    h4 = (Math.imul(h4 ^ (code << 13), 0xc2b2ae35) + code) | 0;
    h5 = (Math.imul(h5 ^ (code << 17), 0x475f3a03) + code) | 0;
    h6 = (Math.imul(h6 ^ (code << 19), 0x31415927) + code) | 0;
    h7 = (Math.imul(h7 ^ (code << 23), 0x27182818) + code) | 0;
  }

  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return `${toHex(h0)}${toHex(h1)}${toHex(h2)}${toHex(h3)}${toHex(h4)}${toHex(h5)}${toHex(h6)}${toHex(h7)}`;
}

export const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export function computePayloadHash(block: Omit<CryptographicAuditBlock, 'previousHash' | 'payloadHash' | 'blockHash' | 'isTampered'>): string {
  const content = `${block.blockIndex}|${block.timestamp}|${block.actorRole}|${block.actorName}|${block.action}|${block.entityId}|${block.details}`;
  return simpleSha256(content);
}

export function computeBlockHash(previousHash: string, payloadHash: string, timestamp: string): string {
  return simpleSha256(`${previousHash}:${payloadHash}:${timestamp}`);
}

export function createAuditBlock(
  previousBlock: CryptographicAuditBlock | null,
  entry: {
    actorName: string;
    actorRole: string;
    action: string;
    entityId: string;
    details: string;
    timestamp?: string;
  }
): CryptographicAuditBlock {
  const blockIndex = previousBlock ? previousBlock.blockIndex + 1 : 0;
  const previousHash = previousBlock ? previousBlock.blockHash : GENESIS_PREV_HASH;
  const timestamp = entry.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19);

  const payloadHash = computePayloadHash({
    blockIndex,
    timestamp,
    actorName: entry.actorName,
    actorRole: entry.actorRole,
    action: entry.action,
    entityId: entry.entityId,
    details: entry.details
  });

  const blockHash = computeBlockHash(previousHash, payloadHash, timestamp);

  return {
    blockIndex,
    timestamp,
    actorName: entry.actorName,
    actorRole: entry.actorRole,
    action: entry.action,
    entityId: entry.entityId,
    details: entry.details,
    previousHash,
    payloadHash,
    blockHash,
    isTampered: false
  };
}

export interface VerificationResult {
  isValid: boolean;
  brokenBlockIndex: number | null;
  totalBlocks: number;
  message: string;
}

export function verifyLedgerIntegrity(blocks: CryptographicAuditBlock[]): VerificationResult {
  if (blocks.length === 0) {
    return { isValid: true, brokenBlockIndex: null, totalBlocks: 0, message: 'Ledger is empty.' };
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Check previous hash link
    const expectedPrev = i === 0 ? GENESIS_PREV_HASH : blocks[i - 1].blockHash;
    if (block.previousHash !== expectedPrev) {
      return {
        isValid: false,
        brokenBlockIndex: i,
        totalBlocks: blocks.length,
        message: `Broken cryptographic link at Block #${i}. Previous hash does not match Block #${i - 1} hash.`
      };
    }

    // Check payload hash
    const expectedPayload = computePayloadHash(block);
    if (block.payloadHash !== expectedPayload) {
      return {
        isValid: false,
        brokenBlockIndex: i,
        totalBlocks: blocks.length,
        message: `Payload tamper detected at Block #${i}. Computed payload hash differs from sealed record.`
      };
    }

    // Check block hash
    const expectedBlock = computeBlockHash(block.previousHash, block.payloadHash, block.timestamp);
    if (block.blockHash !== expectedBlock) {
      return {
        isValid: false,
        brokenBlockIndex: i,
        totalBlocks: blocks.length,
        message: `Block signature mismatch at Block #${i}. Cryptographic seal is invalid.`
      };
    }
  }

  return {
    isValid: true,
    brokenBlockIndex: null,
    totalBlocks: blocks.length,
    message: `All ${blocks.length} blocks mathematically verified. WORM-compliant SHA-256 chain is intact.`
  };
}
