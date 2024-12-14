import { ethers, BrowserProvider } from 'ethers';
import ABI from '../ABI.json';

//const contractAddress = "0x7F270E57874aEC8ceAdDe668Ec54E325d59310C0";//0x6368547551383aD8B2D21a844D0C9Ace61113FF5
const contractAddress = "0x5877d74e97471A4661A2AF95Dd85301F5EDb9b01";
const HOLESKY_RPC_URL = "https://ethereum-holesky.publicnode.com";

export const getContract = async (withSigner = false) => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('请安装MetaMask!');
    }

    // 检查当前网络是否是 Holesky
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0x4268') { // Holesky 的 chainId 是 17000 (0x4268)
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x4268' }],
            });
        } catch (switchError) {
            // 如果用户还没有添加 Holesky 网络，则添加它
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x4268',
                            chainName: 'Holesky Testnet',
                            nativeCurrency: {
                                name: 'ETH',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: [HOLESKY_RPC_URL],
                            blockExplorerUrls: ['https://holesky.etherscan.io']
                        }]
                    });
                } catch (addError) {
                    throw new Error('添加 Holesky 网络失败');
                }
            } else {
                throw new Error('切换到 Holesky 网络失败');
            }
        }
    }

    const provider = new BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
        contractAddress,
        ABI,
        withSigner ? await provider.getSigner() : provider
    );

    return contract;
}; 