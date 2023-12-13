export interface AssetContract {
  address: string;
  asset_contract_type: string;
  chain_identifier: string;
  created_date: string;
  name: string;
  nft_version?: string;
  opensea_version?: string;
  owner?: number;
  schema_name: string;
  symbol: string;
  total_supply?: string;
  description: string;
  external_link?: string;
  image_url?: string;
  default_to_fiat: boolean;
  dev_buyer_fee_basis_points: number;
  dev_seller_fee_basis_points: number;
  only_proxied_transfers: boolean;
  opensea_buyer_fee_basis_points: number;
  opensea_seller_fee_basis_points: number;
  buyer_fee_basis_points: number;
  seller_fee_basis_points: number;
  payout_address?: string;
}

export interface Collection {
  banner_image_url?: string;
  chat_url?: string;
  created_date: string;
  default_to_fiat: boolean;
  description: string;
  dev_buyer_fee_basis_points: string;
  dev_seller_fee_basis_points: string;
  discord_url?: string;
  display_data: DisplayData;
  external_url?: string;
  featured: boolean;
  featured_image_url?: string;
  hidden: boolean;
  safelist_request_status: string;
  image_url: string;
  is_subject_to_whitelist: boolean;
  large_image_url?: string;
  medium_username?: string;
  name: string;
  only_proxied_transfers: boolean;
  opensea_buyer_fee_basis_points: string;
  opensea_seller_fee_basis_points: number;
  payout_address?: string;
  require_email: boolean;
  short_description?: string;
  slug: string;
  telegram_url?: string;
  twitter_username?: string;
  instagram_username: any;
  wiki_url?: string;
  is_nsfw: boolean;
  fees: Fees;
  is_rarity_enabled: boolean;
  is_creator_fees_enforced: boolean;
}

export interface DisplayData {
  card_display_style: string;
  images?: string[];
}

export interface Fees {
  seller_fees?: SellerFees;
  opensea_fees?: OpenseaFees;
}

export interface SellerFees {
  [key: string]: number;
}

export interface OpenseaFees {
  [key: string]: number;
}

export interface Creator {
  user: User;
  address: string;
  config: string;
  profile_img_url: string;
}

export interface User {
  username?: string;
}

export interface Trait {
  trait_type: string;
  display_type?: string;
  max_value: string | number;
  trait_count: number;
  order: string;
  value: string | number;
}

export interface RarityData {
  strategy_id: string;
  strategy_version: string;
  rank: number;
  score: number;
  calculated_at: string;
  max_rank: number;
  tokens_scored: number;
  ranking_features: {
    unique_attribute_count: number;
  };
}

export interface Asset {
  id: number;
  token_id: string;
  num_sales: number;
  background_color: string;
  image_url: string;
  image_preview_url: string;
  image_thumbnail_url: string;
  image_original_url?: string;
  animation_url: string;
  animation_original_url: string;
  name: string;
  description?: string;
  external_link?: string;
  asset_contract: AssetContract;
  permalink: string;
  collection: Collection;
  decimals: string;
  token_metadata?: string;
  is_nsfw: boolean;
  owner: string;
  seaport_sell_orders: string;
  creator: Creator;
  traits: Trait[];
  last_sale: string;
  top_bid: string;
  listing_date: string;
  supports_wyvern: boolean;
  rarity_data?: RarityData;
  transfer_fee: string;
  transfer_fee_payment_token: string;
}

export interface OpenSeaAssetsResponse {
  next?: string;
  previous?: string;
  assets: Asset[];
}

export interface NFTClient {
  getNFTs(address: string): Promise<OpenSeaAssetsResponse>;
}
