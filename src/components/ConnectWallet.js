import React, { useState } from 'react';
import Web3 from 'web3';

const ConnectWallet = () => {
    const [account, setAccount] = useState('');

    const connectWallet = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
        } else {
            alert('请安装MetaMask!');
        }
    };

    return (
        <div>
            <button onClick={connectWallet}>连接钱包</button>
            {account && <p>已连接账户: {account}</p>}
        </div>
    );
};

export default ConnectWallet; 