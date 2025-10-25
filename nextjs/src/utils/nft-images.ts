// NFT image URLs - randomly selected for each NFT
export const NFT_IMAGES = [
  "https://media.giphy.com/media/wMe10X0lkR0Oxm2Cbg/giphy.gif",
  "https://media.giphy.com/media/TEBTrwcE232dotazgn/giphy.gif",
  "https://media.giphy.com/media/E8PnkJS2rDBMAcaj7x/giphy.gif",
  "https://media.giphy.com/media/lVSi4mlnI5gKyPwAFT/giphy.gif",
  "https://media.giphy.com/media/tX9Myr2kUio7Q1JYSs/giphy.gif",
];

export function getRandomNftImage(): string {
  const randomIndex = Math.floor(Math.random() * NFT_IMAGES.length);
  return NFT_IMAGES[randomIndex];
}

export function getNftImageByTokenId(tokenId: number): string {
  // Use token ID to deterministically select image (same token always gets same image)
  const index = tokenId % NFT_IMAGES.length;
  return NFT_IMAGES[index];
}
