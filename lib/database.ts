import { Pool } from "pg";
import type { HashResponse } from "@/lib/validation";

// Database connection configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Increased to 5 seconds for better connection stability
};

// Create a connection pool
export const pool = new Pool(dbConfig);

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    
    // Create users table for Telegram Web App authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255),
        username VARCHAR(255),
        language_code VARCHAR(10),
        is_premium BOOLEAN DEFAULT false,
        is_bot BOOLEAN DEFAULT false,
        photo_url TEXT,
        added_to_attachment_menu BOOLEAN DEFAULT false,
        allows_write_to_pm BOOLEAN DEFAULT false,
        wallet_address VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on username for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `);

    // Create index on wallet_address for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address)
    `);

    // Create proofs table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS proofs (
        id SERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        hash VARCHAR(255) UNIQUE NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        ton_transaction_hash VARCHAR(255),
        ton_transaction_lt VARCHAR(255),
        tonscan_url TEXT,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        error_message TEXT,
        last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on hash for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_proofs_hash ON proofs(hash)
    `);

    // Create index on ton_transaction_hash for TON lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_proofs_ton_hash ON proofs(ton_transaction_hash)
    `);

    // Create index on user_id for faster user proof lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_proofs_user_id ON proofs(user_id)
    `);

    // Ensure new columns exist for backwards compatibility
    await client.query(`
      ALTER TABLE proofs
      ADD COLUMN IF NOT EXISTS tonscan_url TEXT
    `);

    await client.query(`
      ALTER TABLE proofs
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending'
    `);

    await client.query(`
      ALTER TABLE proofs
      ADD COLUMN IF NOT EXISTS error_message TEXT
    `);

    await client.query(`
      ALTER TABLE proofs
      ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    client.release();
  } catch (error) {
    throw error;
  }
}

export type ProofRow = {
  id: number;
  user_id: number | null; // Legacy: Telegram ID (old users table)
  user_v2_id: string | null; // New: UUID (users_v2 table)
  hash: string;
  file_name: string;
  file_size: number;
  file_type: string;
  ton_transaction_hash: string | null;
  ton_transaction_lt: string | null;
  tonscan_url: string | null;
  status: string | null;
  error_message: string | null;
  last_checked_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

const normalizeTimestamp = (value: Date | string | null | undefined) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
};

// Database query helpers
export class DatabaseService {
  static toHashResponse(proof: ProofRow): HashResponse {
    return {
      id: String(proof.id),
      hash: proof.hash,
      tonscanUrl: proof.tonscan_url ?? null,
      createdAt: normalizeTimestamp(proof.created_at) ?? new Date().toISOString(),
      tonTransactionHash: proof.ton_transaction_hash ?? null,
      tonTransactionLt: proof.ton_transaction_lt ?? null,
      status: (proof.status ?? 'pending') as HashResponse['status'],
      errorMessage: proof.error_message ?? null,
      lastCheckedAt: normalizeTimestamp(proof.last_checked_at),
      fileName: proof.file_name,
      fileSize: proof.file_size,
      fileType: proof.file_type,
      userId: proof.user_v2_id ?? null,
      walletAddress: (proof as ProofRow & { wallet_address?: string }).wallet_address ?? null,
    };
  }

  // Save proof to database
  static async saveProof(proofData: {
    userId?: string; // UUID from users_v2 table
    hash: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    tonTransactionHash?: string;
    tonTransactionLt?: string;
    tonscanUrl?: string | null;
    status?: string;
    errorMessage?: string | null;
  }) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO proofs (user_v2_id, hash, file_name, file_size, file_type, ton_transaction_hash, ton_transaction_lt, tonscan_url, status, error_message)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'pending'), $10)
        RETURNING *
      `, [
        proofData.userId || null,
        proofData.hash,
        proofData.fileName,
        proofData.fileSize,
        proofData.fileType,
        proofData.tonTransactionHash,
        proofData.tonTransactionLt,
        proofData.tonscanUrl,
        proofData.status,
        proofData.errorMessage
      ]);
      return result.rows[0] as ProofRow;
    } finally {
      client.release();
    }
  }

  // Get proof by hash (returns most recent)
  static async getProofByHash(hash: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM proofs WHERE hash = $1 ORDER BY created_at DESC LIMIT 1
      `, [hash]);
      return (result.rows[0] as ProofRow | undefined) || null;
    } finally {
      client.release();
    }
  }

  // Get all proofs by hash (for history)
  static async getAllProofsByHash(hash: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM proofs WHERE hash = $1 ORDER BY created_at DESC
      `, [hash]);
      return result.rows as ProofRow[];
    } finally {
      client.release();
    }
  }

  // Get proof by ID with wallet address
  static async getProofById(id: number) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT p.*, u.wallet_address 
        FROM proofs p
        LEFT JOIN users_v2 u ON p.user_v2_id = u.id
        WHERE p.id = $1
      `, [id]);
      return (result.rows[0] as ProofRow | undefined) || null;
    } finally {
      client.release();
    }
  }

  // Get all proofs
  static async getAllProofs() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM proofs ORDER BY created_at DESC
      `);
      return result.rows as ProofRow[];
    } finally {
      client.release();
    }
  }

  // Update proof with TON transaction data
  static async updateProofWithTonData(
    hash: string,
    tonTransactionHash: string,
    tonTransactionLt: string,
    tonscanUrl: string,
    status: string,
    errorMessage?: string | null
  ) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE proofs 
        SET ton_transaction_hash = $2,
            ton_transaction_lt = $3,
            tonscan_url = $4,
            status = $5,
            error_message = $6,
            last_checked_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE hash = $1
        RETURNING *
      `, [hash, tonTransactionHash, tonTransactionLt, tonscanUrl, status, errorMessage ?? null]);
      return (result.rows[0] as ProofRow | undefined) || null;
    } finally {
      client.release();
    }
  }

  static async updateProofStatus(
    hash: string,
    status: string,
    errorMessage?: string | null
  ) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE proofs
        SET status = $2,
            error_message = $3,
            last_checked_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE hash = $1
        RETURNING *
      `, [hash, status, errorMessage ?? null]);
      return (result.rows[0] as ProofRow | undefined) || null;
    } finally {
      client.release();
    }
  }

  // Update proof with verification results
  static async updateProofVerification(
    proofId: number,
    data: {
      status: string;
      tonTransactionHash?: string;
      tonTransactionLt?: string;
      tonscanUrl?: string;
      errorMessage?: string | null;
    }
  ) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE proofs
        SET status = $2,
            ton_transaction_hash = COALESCE($3, ton_transaction_hash),
            ton_transaction_lt = COALESCE($4, ton_transaction_lt),
            tonscan_url = COALESCE($5, tonscan_url),
            error_message = $6,
            last_checked_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [
        proofId,
        data.status,
        data.tonTransactionHash,
        data.tonTransactionLt,
        data.tonscanUrl,
        data.errorMessage ?? null
      ]);
      return (result.rows[0] as ProofRow | undefined) || null;
    } finally {
      client.release();
    }
  }

  // Get proofs by user ID (supports both old user_id and new user_v2_id)
  static async getProofsByUserId(userId: number | string) {
    const client = await pool.connect();
    try {
      // Check if userId is UUID (string) or old Telegram ID (number)
      const isUUID = typeof userId === 'string' && userId.includes('-');
      
      if (isUUID) {
        // New: Query by user_v2_id (UUID)
        const result = await client.query(`
          SELECT * FROM proofs WHERE user_v2_id = $1 ORDER BY created_at DESC
        `, [userId]);
        return result.rows;
      } else {
        // Legacy: Query by user_id (Telegram ID)
        const result = await client.query(`
          SELECT * FROM proofs WHERE user_id = $1 ORDER BY created_at DESC
        `, [userId]);
        return result.rows;
      }
    } finally {
      client.release();
    }
  }

  // User management methods for Telegram Web App

  // Save or update user from Telegram Web App
  static async saveUser(userData: {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    isPremium?: boolean;
    isBot?: boolean;
    photoUrl?: string;
    addedToAttachmentMenu?: boolean;
    allowsWriteToPm?: boolean;
  }) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO users (
          id, first_name, last_name, username, language_code, 
          is_premium, is_bot, photo_url, added_to_attachment_menu, 
          allows_write_to_pm, last_login
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          username = EXCLUDED.username,
          language_code = EXCLUDED.language_code,
          is_premium = EXCLUDED.is_premium,
          is_bot = EXCLUDED.is_bot,
          photo_url = EXCLUDED.photo_url,
          added_to_attachment_menu = EXCLUDED.added_to_attachment_menu,
          allows_write_to_pm = EXCLUDED.allows_write_to_pm,
          updated_at = CURRENT_TIMESTAMP,
          last_login = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        userData.id,
        userData.firstName,
        userData.lastName,
        userData.username,
        userData.languageCode,
        userData.isPremium || false,
        userData.isBot || false,
        userData.photoUrl,
        userData.addedToAttachmentMenu || false,
        userData.allowsWriteToPm || false
      ]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Get user by Telegram ID
  static async getUserById(id: number) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM users WHERE id = $1
      `, [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Get user by username
  static async getUserByUsername(username: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM users WHERE username = $1
      `, [username]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Get all users
  static async getAllUsers() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM users ORDER BY last_login DESC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Update user last login
  static async updateUserLastLogin(id: number) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
