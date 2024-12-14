import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/contract';
import { formatEther, parseEther, parseUnits } from 'ethers';
import { getIPFSUrl, getIPFSMetadata } from '../utils/ipfs';

const MyNFTs = () => {
    const [myNFTs, setMyNFTs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listingPrice, setListingPrice] = useState('');
    const [listingTokenId, setListingTokenId] = useState(null);
    const [isListing, setIsListing] = useState(false);

    useEffect(() => {
        loadMyNFTs();
    }, []);

    const loadMyNFTs = async () => {
        try {
            const contract = await getContract();
            const totalTokens = await contract.tokenCounter();
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });
            const currentAddress = accounts[0];
            const items = [];

            for (let i = 0; i < totalTokens; i++) {
                try {
                    const seller = await contract.tokenSeller(i);
                    const owner = await contract.ownerOf(i);
                    
                    if (seller.toLowerCase() === currentAddress.toLowerCase() || 
                        owner.toLowerCase() === currentAddress.toLowerCase()) {
                        const tokenURI = await contract.tokenURI(i);
                        const price = await contract.tokenPrice(i);
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
                            owner,
                            isListed: seller !== '0x0000000000000000000000000000000000000000'
                        });
                    }
                } catch (error) {
                    console.error(`加载Token ${i}失败:`, error);
                }
            }
            setMyNFTs(items);
        } catch (error) {
            console.error('加载我的NFT失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleListNFT = async (tokenId) => {
        if (!listingPrice) {
            alert('请输入价格');
            return;
        }

        if (isNaN(listingPrice) || parseFloat(listingPrice) <= 0) {
            alert('请输入有效的价格');
            return;
        }

        setIsListing(true);
        try {
            const contract = await getContract(true);
            const priceInWei = parseUnits(listingPrice.toString(), "wei");
            const tx = await contract.listNFT(tokenId, priceInWei);
            await tx.wait();
            setListingTokenId(null);
            setListingPrice('');
            loadMyNFTs(); // 重新加载NFT列表
        } catch (error) {
            console.error('上架NFT失败:', error);
            alert(error.message || '上架失败，请重试');
        } finally {
            setIsListing(false);
        }
    };

    const cancelListing = async (tokenId) => {
        try {
            const contract = await getContract(true);
            const tx = await contract.cancelListing(tokenId);
            await tx.wait();
            loadMyNFTs();
        } catch (error) {
            console.error('取消上架失败:', error);
            alert(error.message || '取消上架失败，请重试');
        }
    };

    if (loading) return (
        <div className="loading">
            <div className="loading-spinner"></div>
            <p>正在加载您的 NFT...</p>
        </div>
    );

    return (
        <div className="my-nfts">
            <h2>我的NFT</h2>
            <div className="nft-grid">
                {myNFTs.map(nft => (
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
                            <p className="status">状态: {nft.isListed ? '在售' : '未上架'}</p>
                            {nft.isListed ? (
                                <>
                                    <p className="price">价格: {nft.price} WEI</p>
                                    <button 
                                        onClick={() => cancelListing(nft.tokenId)}
                                        className="cancel-button"
                                        disabled={isListing}
                                    >
                                        取消上架
                                    </button>
                                </>
                            ) : (
                                <>
                                    {listingTokenId === nft.tokenId ? (
                                        <div className="listing-form">
                                            <input
                                                type="number"
                                                step="1"
                                                min="1"
                                                placeholder="输入价格 (WEI)"
                                                value={listingPrice}
                                                onChange={(e) => setListingPrice(e.target.value)}
                                                className="price-input"
                                            />
                                            <div className="listing-buttons">
                                                <button 
                                                    onClick={() => handleListNFT(nft.tokenId)}
                                                    className="list-button"
                                                    disabled={isListing}
                                                >
                                                    {isListing ? '上架中...' : '确认上架'}
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setListingTokenId(null);
                                                        setListingPrice('');
                                                    }}
                                                    className="cancel-button"
                                                    disabled={isListing}
                                                >
                                                    取消
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setListingTokenId(nft.tokenId)}
                                            className="list-button"
                                        >
                                            上架NFT
                                        </button>
                                    )}
                                </>
                            )}
                            <p className="owner">所有者: {nft.owner.substring(0, 6)}...{nft.owner.substring(38)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyNFTs; 