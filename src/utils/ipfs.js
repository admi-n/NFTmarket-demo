export const IPFS_GATEWAY = "https://fuchsia-given-marsupial-389.mypinata.cloud/ipfs/";

export const getIPFSUrl = (uri) => {
    if (!uri) return '';
    if (uri.startsWith('http')) return uri;
    
    // 如果是完整的 ipfs:// 链接，移除前缀
    if (uri.startsWith('ipfs://')) {
        return `${IPFS_GATEWAY}${uri.replace('ipfs://', '')}`;
    }
    
    // 如果只是 hash 值，直接拼接
    return `${IPFS_GATEWAY}${uri}`;
};

export const getIPFSMetadata = async (uri) => {
    try {
        // 对于直接的 hash 值，我们认为它就是元数据本身
        const url = getIPFSUrl(uri);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 如果返回的数据本身就包含了图片信息，直接返回
        if (data.image) {
            return data;
        }
        
        // 否则，构造一个基本的元数据对象
        return {
            name: `NFT #${uri.substring(0, 6)}`,
            description: '这是一个 NFT',
            image: uri // 使用输入的 URI 作为图片地址
        };
    } catch (error) {
        console.error('获取IPFS元数据失败:', error);
        return {
            name: `NFT #${uri.substring(0, 6)}`,
            description: '这是一个 NFT',
            image: uri
        };
    }
}; 