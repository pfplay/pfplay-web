import { AxiosResponse } from 'axios';

export interface AlchemyNFTsResponse {
  ownedNfts: OwnedNft[];
  totalCount: number;
  validAt: ValidAt;
  pageKey: string;
}

export interface OwnedNft {
  contract: Contract;
  tokenId: string;
  tokenType: string;
  name: string;
  description?: string;
  tokenUri?: string;
  image: Image;
  raw: Raw;
  collection: Collection;
  mint: Mint;
  owners?: string;
  timeLastUpdated: string;
  balance: string;
  acquiredAt: object;
}

export interface Contract {
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

export interface OpenSeaMetadata {
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

export interface Image {
  cachedUrl?: string;
  thumbnailUrl?: string;
  pngUrl?: string;
  contentType?: string;
  size?: string;
  originalUrl?: string;
}

export interface Raw {
  tokenUri?: string;
  metadata: object;
  error?: string;
}

export interface Collection {
  name: string;
  slug: string;
  externalUrl: any;
  bannerImageUrl: string;
}

export interface Mint {
  mintAddress?: string;
  blockNumber?: number;
  timestamp?: string;
  transactionHash?: string;
}

export interface ValidAt {
  blockNumber: number;
  blockHash: string;
  blockTimestamp: string;
}

export interface Nft {
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name: string;
  description: string;
  image_url: string;
  metadata_url: string;
  opensea_url: string;
  updated_at: string;
  is_disabled: boolean;
  is_nsfw: boolean;
}

export interface NFTClient {
  getNFTs(address: string): Promise<AlchemyNFTsResponse>;
  checkImageUrlStatus(imageUrl: string): Promise<AxiosResponse>;
}
