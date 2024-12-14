import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/contract';
import { getIPFSUrl, getIPFSMetadata } from '../utils/ipfs';

const MintNFT = () => {
    const [tokenURI, setTokenURI] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        loadPreview();
    }, [tokenURI]);

    const loadPreview = async () => {
        if (!tokenURI) {
            setPreview(null);
            return;
        }

        try {
            const imageUrl = getIPFSUrl(tokenURI);
            setPreview({
                imageUrl,
                name: `NFT #${tokenURI.substring(0, 6)}`,
                description: '这是一个 NFT'
            });
            
            const metadata = await getIPFSMetadata(tokenURI);
            if (metadata) {
                setPreview({
                    imageUrl: metadata.image ? getIPFSUrl(metadata.image) : imageUrl,
                    name: metadata.name || `NFT #${tokenURI.substring(0, 6)}`,
                    description: metadata.description || '这是一个 NFT'
                });
            }
        } catch (error) {
            console.error('加载预览失败:', error);
            setPreview({
                imageUrl: getIPFSUrl(tokenURI),
                name: `NFT #${tokenURI.substring(0, 6)}`,
                description: '这是一个 NFT'
            });
        }
    };

    const mintNFT = async () => {
        if (!tokenURI) {
            setMessage('请输入Token URI');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const contract = await getContract(true);
            const tx = await contract.mintNFT(tokenURI);
            setMessage('铸造中...');
            
            await tx.wait();
            setMessage('NFT铸造成功！');
            setTokenURI(''); // 清空输入框
            setPreview(null); // 清空预览
        } catch (error) {
            console.error('铸造NFT失败:', error);
            setMessage(error.message || '铸造NFT失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mint-nft">
            <h2>铸造新NFT</h2>
            <div className="mint-form">
                <input
                    type="text"
                    placeholder="输入Token URI (例如: ipfs://...)"
                    value={tokenURI}
                    onChange={(e) => setTokenURI(e.target.value)}
                    disabled={loading}
                />
                {preview && (
                    <div className="nft-preview">
                        <div className="nft-image">
                            <img src={preview.imageUrl} alt={preview.name} />
                        </div>
                        <h3>{preview.name}</h3>
                        {preview.description && (
                            <p className="description">{preview.description}</p>
                        )}
                    </div>
                )}
                <button 
                    onClick={mintNFT} 
                    disabled={loading}
                    className="mint-button"
                >
                    {loading ? '铸造中...' : '铸造NFT'}
                </button>
                {message && <p className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
                    {message}
                </p>}
            </div>
        </div>
    );
};

export default MintNFT; 