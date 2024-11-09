import type { Abi } from 'abitype';
import type { ContractFunctionName, ContractFunctionArgs } from 'viem';
import queryString from 'querystring';
import crypto from 'crypto';
import base32Encode from 'base32-encode';

export interface SignchainClientOptions {
  url?: string;
  apiKey: string;
  vaultId: string;
  authSecretKey?: string | null;
}

const defaultClientOptions = {
  url: 'https://signchain.net',
  authSecretKey: null,
}

export interface Signature {
  nonce: `0x${string}`;
  r: `0x${string}`;
  s: `0x${string}`;
  v: number;
}

export type Chain = 'local' | 'ethereum' | 'sepolia' | 'bsc' | 'bsc-testnet' | 'polygon' | 'amoy' | 'avalanche' | 'fuji';

export type SignOptions<
  abi extends Abi | unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chain extends Chain
> = {
  contract: `0x${string}`;
  chain: chain;
  sender: `0x${string}`;
  abi: abi;
  functionName: functionName;
  args: args extends readonly [ ...infer P, Signature ] ? P : never;
} & (chain extends 'local' ? {
  uniq: `0x${string}`;
  signer: `0x${string}`;
} : {});

export interface Wallet {
  id: string;
  account: string;
  vault: string;
  name: string;
  address: `0x${string}`;
  created: Date;
  updated: Date;
  expires?: Date;
}

export interface CreateWalletOptions {
  name: string;
}

const assimilateWallet = (json: any): Wallet => {
  const { created, updated, expires, ...rest } = json;
  const out = {
    ...rest,
    created: new Date(created),
    updated: new Date(updated),
  };
  if (expires) {
    out.expires = new Date(expires);
  }
  return out;
};

export interface ListWalletsOptions {
  offset?: number;
  count?: number;
}

export interface ListWalletsResult {
  count: number;
  page: Wallet[]
};

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UpdateWalletOptions {
  name: string;
}

const createAuthSignature = (authSecretKey: string, data: Uint8Array, timestamp: Date = new Date()) => {
  const nonce = crypto.randomBytes(32);
  const timestampBytes = Buffer.alloc(8);
  timestampBytes.writeBigUint64BE(BigInt(timestamp.getTime()));

  const hash = crypto.createHash('sha256');
  hash.update(data);
  hash.update(nonce);
  hash.update(timestampBytes);
  hash.update(Buffer.from(authSecretKey, 'utf8'));

  const signature = [
    base32Encode(nonce, 'RFC4648').toLowerCase(),
    base32Encode(timestampBytes, 'RFC4648').toLowerCase(),
    base32Encode(hash.digest(), 'RFC4648').toLowerCase(),
  ].join('.');

  return signature;
};

export class SignchainClient {
  readonly options: Required<SignchainClientOptions>;

  constructor(options: SignchainClientOptions) {
    this.options = Object.assign({}, defaultClientOptions, options) as Required<SignchainClientOptions>;
  }

  async sign<
    abi extends Abi,
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
    chain extends Chain
  >(options: SignOptions<abi, functionName, args, chain>): Promise<ContractFunctionArgs<
      abi,
      'nonpayable' | 'payable',
      functionName
    >> {
    const url = `${this.options.url}/api/v1/vaults/${this.options.vaultId}/sign`;

    const body = Object.assign({}, {
      chain: options.chain,
      contract: options.contract,
      sender: options.sender,
      uniq: (options as any).uniq,
      signer: (options as any).signer,
      abi: options.abi.find((x: any) => x.name === options.functionName),
      args: options.args,
    });

    const bodyBuffer = Buffer.from(JSON.stringify(body, (k, v) => {
      if (typeof v === 'bigint') {
        return v.toString();
      } else {
        return v;
      }
    }, 2), 'utf8');

    const extraHeaders: Record<string, string> = {};

    if (this.options.authSecretKey) {
      extraHeaders['X-Vault-Auth-Signature'] = createAuthSignature(this.options.authSecretKey, bodyBuffer);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...extraHeaders,
      },
      body: bodyBuffer,
    });

    const json: APIResponse = await response.json();

    if (!json.success) {
      throw new Error(json.error);
    }

    return json.data;
  };

  async createWallet({ name }: CreateWalletOptions): Promise<Wallet> {
    const url = `${this.options.url}/api/v1/vaults/${this.options.vaultId}/wallets`;

    const body = Object.assign({}, {
      name
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
    });

    const json: APIResponse = await response.json();

    if (!json.success) {
      throw new Error(json.error);
    }
    
    return assimilateWallet(json);
  }

  async getWallet(address: `0x${string}`): Promise<Wallet> {
     const url = `${this.options.url}/api/v1/vaults/${this.options.vaultId}/wallets/${address}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    const json: APIResponse = await response.json();

    if (!json.success) {
      throw new Error(json.error);
    }

    return assimilateWallet(json);
  }

  async listWallets(options: ListWalletsOptions): Promise<ListWalletsResult> {
    let search: any = {};
    
    if (typeof options.offset !== 'undefined' && options.offset !== null) {
      search.offset = options.offset;
    }
    if (typeof options.count !== 'undefined' && options.count !== null) {
      search.count = options.count;
    }

    search = queryString.stringify(search);

    const url = `${this.options.url}/api/v1/vaults/${this.options.vaultId}/wallets${search !== '' ? `?${search}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    const json: APIResponse<ListWalletsResult> = await response.json();

    if (!json.success) {
      throw new Error(json.error);
    }

    return {
      count: json.data.count,
      page: json.data.page.map(json => assimilateWallet(json)),
    };
  }

  async updateWallet(address: `0x${string}`, { name }: UpdateWalletOptions): Promise<Wallet> {
    const url = `${this.options.url}/api/v1/vaults/${this.options.vaultId}/wallets/${address}`;

    const body = Object.assign({}, {
      name
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
    });

    const json: APIResponse = await response.json();

    if (!json.success) {
      throw new Error(json.error);
    }
    
    return assimilateWallet(json);
  }

  async expireWallet(address: `0x${string}`): Promise<Wallet> {
    const url = `${this.options.url}/api/v1/vaults/${this.options.vaultId}/wallets/${address}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    const json: APIResponse = await response.json();

    if (!json.success) {
      throw new Error(json.error);
    }
    
    return assimilateWallet(json);
  }

  async unexpireWallet(address: `0x${string}`): Promise<Wallet> {
    const url = `${this.options.url}/api/v1/vaults/${this.options.vaultId}/wallets/${address}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    const json: APIResponse = await response.json();

    if (!json.success) {
      throw new Error(json.error);
    }
    
    return assimilateWallet(json);
  }
}