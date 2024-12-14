import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NFTList from './components/NFTList';
import MyNFTs from './components/MyNFTs';
import MintNFT from './components/MintNFT';
import TransactionHistory from './components/TransactionHistory';
import WalletConnect from './components/WalletConnect';

function App() {
    return (
        <Router>
            <div className="app">
                <nav className="navbar">
                    <div className="nav-links">
                        <Link to="/">市场</Link>
                        <Link to="/my-nfts">我的NFT</Link>
                        <Link to="/mint">铸造NFT</Link>
                        <Link to="/history">交易记录</Link>
                    </div>
                    <WalletConnect />
                </nav>

                <div className="container">
                    <Routes>
                        <Route path="/" element={<NFTList />} />
                        <Route path="/my-nfts" element={<MyNFTs />} />
                        <Route path="/mint" element={<MintNFT />} />
                        <Route path="/history" element={<TransactionHistory />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;