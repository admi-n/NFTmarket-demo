import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav className="navbar">
            <Link to="/">市场</Link>
            <Link to="/my-nfts">我的NFT</Link>
            <Link to="/history">交易记录</Link>
        </nav>
    );
};

export default Navigation; 