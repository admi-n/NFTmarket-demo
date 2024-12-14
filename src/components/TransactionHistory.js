import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/contract';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTransactionHistory();
    }, []);

    const loadTransactionHistory = async () => {
        try {
            console.log("开始加载交易历史...");
            const contract = await getContract();
            
            // 获取从区块链开始到现在的所有事件
            const fromBlock = 0;
            const toBlock = 'latest';
            
            // 获取所有类型的事件
            const purchaseFilter = contract.filters.NFTPurchased();
            const listFilter = contract.filters.NFTListed();
            const cancelFilter = contract.filters.NFTListingCanceled();

            const [purchaseEvents, listEvents, cancelEvents] = await Promise.all([
                contract.queryFilter(purchaseFilter, fromBlock, toBlock),
                contract.queryFilter(listFilter, fromBlock, toBlock),
                contract.queryFilter(cancelFilter, fromBlock, toBlock)
            ]).catch(error => {
                console.error('查询事件失败:', error);
                return [[], [], []]; // 如果查询失败，返回空数组
            });

            console.log("查询到的事件数量:", {
                purchases: purchaseEvents.length,
                listings: listEvents.length,
                cancels: cancelEvents.length
            });

            // 处理所有事件
            const allEvents = await Promise.all([
                ...purchaseEvents.map(async event => {
                    const block = await event.getBlock();
                    return {
                        type: 'purchase',
                        tokenId: event.args[0].toString(),
                        buyer: event.args[1],
                        seller: event.args[2],
                        price: event.args[3].toString(),
                        timestamp: block.timestamp,
                        txHash: event.transactionHash
                    };
                }),
                ...listEvents.map(async event => {
                    const block = await event.getBlock();
                    return {
                        type: 'list',
                        tokenId: event.args[0].toString(),
                        seller: event.args[1],
                        price: event.args[2].toString(),
                        timestamp: block.timestamp,
                        txHash: event.transactionHash
                    };
                }),
                ...cancelEvents.map(async event => {
                    const block = await event.getBlock();
                    return {
                        type: 'cancel',
                        tokenId: event.args[0].toString(),
                        seller: event.args[1],
                        timestamp: block.timestamp,
                        txHash: event.transactionHash
                    };
                })
            ]);

            // 按时间降序排序
            allEvents.sort((a, b) => b.timestamp - a.timestamp);
            console.log("处理后的事件:", allEvents);
            
            setTransactions(allEvents);
        } catch (error) {
            console.error('加载交易记录失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionTypeText = (type) => {
        switch (type) {
            case 'purchase': return '购买';
            case 'list': return '上架';
            case 'cancel': return '取消上架';
            default: return type;
        }
    };

    if (loading) return (
        <div className="loading">
            <div className="loading-spinner"></div>
            <p>正在加载交易记录...</p>
        </div>
    );

    return (
        <div className="transaction-history">
            <div className="header">
                <h2>交易记录</h2>
                <button onClick={loadTransactionHistory} className="refresh-button">
                    刷新
                </button>
            </div>
            <div className="transaction-list">
                {transactions.length === 0 ? (
                    <p className="no-transactions">暂无交易记录</p>
                ) : (
                    transactions.map((tx, index) => (
                        <div key={tx.txHash} className="transaction-item">
                            <div className="transaction-type">
                                {getTransactionTypeText(tx.type)}
                            </div>
                            <div className="transaction-details">
                                <p>Token ID: {tx.tokenId}</p>
                                {tx.type === 'purchase' && (
                                    <>
                                        <p>买家: {tx.buyer.substring(0, 6)}...{tx.buyer.substring(38)}</p>
                                        <p>卖家: {tx.seller.substring(0, 6)}...{tx.seller.substring(38)}</p>
                                        <p>价格: {tx.price} ETH</p>
                                    </>
                                )}
                                {tx.type === 'list' && (
                                    <>
                                        <p>卖家: {tx.seller.substring(0, 6)}...{tx.seller.substring(38)}</p>
                                        <p>价格: {tx.price} ETH</p>
                                    </>
                                )}
                                {tx.type === 'cancel' && (
                                    <p>卖家: {tx.seller.substring(0, 6)}...{tx.seller.substring(38)}</p>
                                )}
                                <p>时间: {new Date(tx.timestamp * 1000).toLocaleString()}</p>
                                <a 
                                    href={`https://holesky.etherscan.io/tx/${tx.txHash}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="tx-link"
                                >
                                    查看交易详情
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransactionHistory; 