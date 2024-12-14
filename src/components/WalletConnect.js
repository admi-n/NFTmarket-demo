import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletConnect = () => {
    const [account, setAccount] = useState('');
    const [balance, setBalance] = useState('');
    const [chainId, setChainId] = useState('');

    useEffect(() => {
        checkWalletConnection();
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, []);

    const checkWalletConnection = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    handleAccountsChanged(accounts);
                }
            } catch (error) {
                console.error('检查钱包���接失败:', error);
            }
        }
    };

    const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            await updateBalance(accounts[0]);
            await updateChainId();
        } else {
            setAccount('');
            setBalance('');
            setChainId('');
        }
    };

    const handleChainChanged = async () => {
        await updateChainId();
        if (account) {
            await updateBalance(account);
        }
    };

    const updateBalance = async (address) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(address);
            setBalance(ethers.formatEther(balance).substring(0, 6));
        } catch (error) {
            console.error('获取余额失败:', error);
        }
    };

    const updateChainId = async () => {
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(chainId, 16).toString());
        } catch (error) {
            console.error('获取链ID失败:', error);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert('请安装MetaMask钱包!');
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            handleAccountsChanged(accounts);
        } catch (error) {
            console.error('连接钱包失败:', error);
        }
    };

    return (
        <div className="wallet-connect">
            {!account ? (
                <button onClick={connectWallet} className="connect-button">
                    连接钱包
                </button>
            ) : (
                <div className="wallet-info">
                    <div className="chain-badge">
                        Chain ID: {chainId}
                    </div>
                    <div className="account-info">
                        <span className="balance">{balance} ETH</span>
                        <span className="address">
                            {account.substring(0, 6)}...{account.substring(38)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletConnect; 