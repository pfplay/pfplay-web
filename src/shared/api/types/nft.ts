import { AxiosResponse } from 'axios';

export interface AlchemyNFTsResponse {
  ownedNfts: OwnedNft[];
  totalCount: number;
  validAt: ValidAt;
  pageKey: string;
}

export interface OwnedNft {
  contract: NftContract;
  tokenId: string;
  tokenType: string;
  name: string;
  description?: string;
  tokenUri?: string;
  image: NftImage;
  raw: NftRaw;
  collection: NftCollection;
  mint: NftMint;
  owners?: string;
  timeLastUpdated: string;
  balance: string;
  acquiredAt: object;
}

interface NftContract {
  address: string;
  name: string;
  symbol: string;
  totalSupply?: string;
  tokenType: string;
  contractDeployer: string;
  deployedBlockNumber: number;
  openSeaMetadata: OpenSeaMetadata;
  isSpam: boolean;
  spamClassifications: string[];
}

interface OpenSeaMetadata {
  floorPrice: number;
  collectionName: string;
  collectionSlug: string;
  safelistRequestStatus: string;
  imageUrl: string;
  description: string;
  externalUrl?: string;
  twitterUsername?: string;
  discordUrl?: string;
  bannerImageUrl: string;
  lastIngestedAt: string;
}

interface NftImage {
  cachedUrl?: string;
  thumbnailUrl?: string;
  pngUrl?: string;
  contentType?: string;
  size?: string;
  originalUrl?: string;
}

interface NftRaw {
  tokenUri?: string;
  metadata: object;
  error?: string;
}

interface NftCollection {
  name: string;
  slug: string;
  externalUrl: any;
  bannerImageUrl: string;
}

interface NftMint {
  mintAddress?: string;
  blockNumber?: number;
  timestamp?: string;
  transactionHash?: string;
}

interface ValidAt {
  blockNumber: number;
  blockHash: string;
  blockTimestamp: string;
}

export interface NFTClient {
  getNFTs(address: string): Promise<AlchemyNFTsResponse>;
  checkImageUrlStatus(imageUrl: string): Promise<AxiosResponse>;
}
