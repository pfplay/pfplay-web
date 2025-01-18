import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import useUpdateMyWallet from '../api/use-update-my-walllet.mutation';

export default function useGlobalWalletSync(myWalletAddress?: string) {
  const { mutate: updateMyWallet } = useUpdateMyWallet();
  const { address: walletAddress, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && walletAddress !== myWalletAddress) {
      updateMyWallet({ walletAddress: walletAddress || '' });
    } else if (!isConnected && myWalletAddress) {
      updateMyWallet({ walletAddress: '' });
    }
  }, [walletAddress, isConnected, myWalletAddress, updateMyWallet]);
}
