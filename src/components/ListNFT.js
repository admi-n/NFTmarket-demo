import React, { useState } from 'react';

const ListNFT = () => {
    const [price, setPrice] = useState('');

    const listNFT = async () => {
        // 这里添加上架NFT的逻辑
        console.log('上架NFT，价格:', price);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="输入价格"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />
            <button onClick={listNFT}>上架NFT</button>
        </div>
    );
};

export default ListNFT; 