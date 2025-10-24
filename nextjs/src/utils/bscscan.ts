const BSCSCAN_URL = process.env.NEXT_PUBLIC_BSCSCAN_URL || 'https://testnet.bscscan.com';

export function getBscScanAddressUrl(address: string): string {
  return `${BSCSCAN_URL}/address/${address}`;
}

export function getBscScanTokenUrl(contractAddress: string, tokenId?: string): string {
  if (tokenId) {
    return `${BSCSCAN_URL}/token/${contractAddress}?a=${tokenId}`;
  }
  return `${BSCSCAN_URL}/token/${contractAddress}`;
}

export function getBscScanTxUrl(txHash: string): string {
  return `${BSCSCAN_URL}/tx/${txHash}`;
}
