import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/contract';
import { formatEther, parseEther } from 'ethers';
import { getIPFSUrl, getIPFSMetadata } from '../utils/ipfs';

const NFTList = () => {
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNFTs();
    }, []);

    const loadNFTs = async () => {
        try {
            const contract = await getContract();
            const totalTokens = await contract.tokenCounter();
            const items = [];
            
            for (let i = 0; i < totalTokens; i++) {
                try {
                    const tokenURI = await contract.tokenURI(i);
                    const price = await contract.tokenPrice(i);
                    const seller = await contract.tokenSeller(i);
                    const metadata = await getIPFSMetadata(tokenURI);
                    
                    items.push({
                        id: i.toString(),
                        tokenId: i.toString(),
                        tokenURI,
                        imageUrl: metadata ? getIPFSUrl(metadata.image) : '',
                        name: metadata?.name || `NFT #${i}`,
                        description: metadata?.description || '',
                        price: price.toString(),
                        seller,
                        isSold: seller === '0x0000000000000000000000000000000000000000'
                    });
                } catch (error) {
                    console.error(`加载Token ${i}失败:`, error);
                }
            }
            setNfts(items);
        } catch (error) {
            console.error('加载NFT列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const buyNFT = async (id, price) => {
        try {
            const contract = await getContract(true);
            const tx = await contract.buyNFT(id, {
                value: price
            });
            await tx.wait();
            loadNFTs();
        } catch (error) {
            console.error('购买NFT失败:', error);
            alert(error.message || '购买失败，请重试');
        }
    };

    if (loading) return (
        <div className="loading">
            <div className="loading-spinner"></div>
            <p>正在加载 NFT 列表...</p>
        </div>
    );

    return (
        <div className="nft-marketplace">
            <h2>NFT 市场</h2>
            <div className="nft-grid">
                {nfts.map(nft => (
                    !nft.isSold && (
                        <div key={nft.id} className="nft-card">
                            <div className="nft-image">
                                {nft.imageUrl ? (
                                    <img 
                                        src={nft.imageUrl} 
                                        alt={nft.name}
                                        onError={(e) => {
                                            console.error('图片加载失败:', nft.imageUrl);
                                            e.target.src = '/placeholder.png';
                                        }}
                                    />
                                ) : (
                                    <div className="no-image">暂无图片</div>
                                )}
                            </div>
                            <div className="nft-info">
                                <h3>{nft.name}</h3>
                                <p className="description">{nft.description}</p>
                                <p className="token-id">Token ID: {nft.tokenId}</p>
                                <p className="price">价格: {nft.price} WEI</p>
                                <p className="seller">卖家: {nft.seller.substring(0, 6)}...{nft.seller.substring(38)}</p>
                                <button 
                                    onClick={() => buyNFT(nft.id, nft.price)}
                                    className="buy-button"
                                >
                                    购买
                                </button>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default NFTList; 