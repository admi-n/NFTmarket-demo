import React from 'react';

const BuyNFT = ({ nft }) => {
    const buyNFT = async () => {
        // 这里添加购买NFT的逻辑
        console.log('购买NFT:', nft);
    };

    return (
        <div>
            <h3>{nft.name}</h3>
            <button onClick={buyNFT}>购买</button>
        </div>
    );
};

export default BuyNFT; 