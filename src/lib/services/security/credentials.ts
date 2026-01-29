// Nexorium Core - Credential Service
// AES-256-GCM encrypted credential management

import prisma from '@/lib/db';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import type { ConnectorCredential } from '@/types';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const key = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY environment variable is required');
  }
  // Key must be exactly 64 hex characters (32 bytes / 256 bits) for AES-256
  if (key.length !== 64) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY must be exactly 64 hex characters (256 bits)');
  }
  // Validate hex format
  if (!/^[0-9a-fA-F]+$/.test(key)) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY must contain only hexadecimal characters');
  }
  return Buffer.from(key, 'hex');
}

// Encrypt configuration data
function encryptConfig(config: Record<string, unknown>): { encrypted: string; iv: string } {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const configString = JSON.stringify(config);
  let encrypted = cipher.update(configString, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();
  const encryptedWithTag = encrypted + authTag.toString('hex');

  return {
    encrypted: encryptedWithTag,
    iv: iv.toString('hex'),
  };
}

// Decrypt configuration data
function decryptConfig(encryptedWithTag: string, ivHex: string): Record<string, unknown> {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');

  // Extract auth tag from the end
  const authTagHex = encryptedWithTag.slice(-AUTH_TAG_LENGTH * 2);
  const encrypted = encryptedWithTag.slice(0, -AUTH_TAG_LENGTH * 2);
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

// Create a new connector credential
export async function createCredential(data: {
  name: string;
  connectorType: string;
  config: Record<string, unknown>;
  createdBy?: string;
}): Promise<ConnectorCredential> {
  const { encrypted, iv } = encryptConfig(data.config);

  return prisma.connectorCredential.create({
    data: {
      name: data.name,
      connectorType: data.connectorType,
      encryptedConfig: encrypted,
      encryptionIv: iv,
      createdBy: data.createdBy,
    },
  }) as Promise<ConnectorCredential>;
}

// Get credential by ID (without decrypted config)
export async function getCredential(id: string): Promise<ConnectorCredential | null> {
  return prisma.connectorCredential.findUnique({
    where: { id },
  }) as Promise<ConnectorCredential | null>;
}

// Get credential by name (without decrypted config)
export async function getCredentialByName(name: string): Promise<ConnectorCredential | null> {
  return prisma.connectorCredential.findUnique({
    where: { name },
  }) as Promise<ConnectorCredential | null>;
}

// Get decrypted config for a credential (for connector use)
export async function getDecryptedConfig(id: string): Promise<Record<string, unknown> | null> {
  const credential = await prisma.connectorCredential.findUnique({
    where: { id },
  });

  if (!credential) {
    return null;
  }

  try {
    return decryptConfig(credential.encryptedConfig, credential.encryptionIv);
  } catch (error) {
    console.error('Failed to decrypt credential config:', error);
    throw new Error('Failed to decrypt credential configuration');
  }
}

// List all credentials (without decrypted config)
export async function listCredentials(options: {
  connectorType?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { connectorType, limit = 50, offset = 0 } = options;

  const where: Record<string, unknown> = {};
  if (connectorType) where.connectorType = connectorType;

  const [credentials, total] = await Promise.all([
    prisma.connectorCredential.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        connectorType: true,
        lastTestedAt: true,
        lastTestSuccess: true,
        lastRotatedAt: true,
        rotationReminder: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.connectorCredential.count({ where }),
  ]);

  return {
    items: credentials,
    total,
    hasMore: offset + credentials.length < total,
  };
}

// Update credential configuration
export async function updateCredential(
  id: string,
  data: {
    name?: string;
    config?: Record<string, unknown>;
    rotationReminder?: Date;
  }
): Promise<ConnectorCredential> {
  const updateData: Record<string, unknown> = {};

  if (data.name) {
    updateData.name = data.name;
  }

  if (data.config) {
    const { encrypted, iv } = encryptConfig(data.config);
    updateData.encryptedConfig = encrypted;
    updateData.encryptionIv = iv;
    updateData.lastRotatedAt = new Date();
  }

  if (data.rotationReminder) {
    updateData.rotationReminder = data.rotationReminder;
  }

  return prisma.connectorCredential.update({
    where: { id },
    data: updateData,
  }) as Promise<ConnectorCredential>;
}

// Delete a credential
export async function deleteCredential(id: string): Promise<void> {
  await prisma.connectorCredential.delete({
    where: { id },
  });
}

// Record test result for a credential
export async function recordTestResult(
  id: string,
  success: boolean
): Promise<ConnectorCredential> {
  return prisma.connectorCredential.update({
    where: { id },
    data: {
      lastTestedAt: new Date(),
      lastTestSuccess: success,
    },
  }) as Promise<ConnectorCredential>;
}

// Get credentials needing rotation
export async function getCredentialsNeedingRotation(): Promise<ConnectorCredential[]> {
  const now = new Date();

  return prisma.connectorCredential.findMany({
    where: {
      rotationReminder: {
        lte: now,
      },
    },
    orderBy: { rotationReminder: 'asc' },
  }) as Promise<ConnectorCredential[]>;
}

// Test connector connectivity (generic test)
export async function testConnectorConnectivity(
  id: string,
  testFn: (config: Record<string, unknown>) => Promise<boolean>
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getDecryptedConfig(id);
    if (!config) {
      return { success: false, error: 'Credential not found' };
    }

    const success = await testFn(config);
    await recordTestResult(id, success);

    return { success };
  } catch (error) {
    await recordTestResult(id, false);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
