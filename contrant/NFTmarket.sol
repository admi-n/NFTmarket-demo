// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    mapping(uint256 => uint256) public tokenPrice;
    mapping(uint256 => address) public tokenSeller;

    event NFTPurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTListingCanceled(uint256 indexed tokenId, address indexed seller);

    constructor() ERC721("NFT Marketplace", "NFTM") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    function mintNFT(string memory tokenURI) public returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        tokenCounter++;
        return newTokenId;
    }

    // 上架 NFT
    function listNFT(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can list the NFT");
        require(price > 0, "Price must be greater than 0");

        tokenPrice[tokenId] = price;
        tokenSeller[tokenId] = msg.sender;

        emit NFTListed(tokenId, msg.sender, price);
    }

    // 购买 NFT
    function buyNFT(uint256 tokenId) public payable {
        uint256 price = tokenPrice[tokenId];
        address seller = tokenSeller[tokenId];
        require(msg.value >= price, "Insufficient funds");
        require(seller != address(0), "NFT not listed for sale");

        payable(seller).transfer(msg.value);
        _transfer(seller, msg.sender, tokenId);

        emit NFTPurchased(tokenId, msg.sender, seller, msg.value);

        delete tokenPrice[tokenId];
        delete tokenSeller[tokenId];
    }

    // 取消上架 NFT
    function cancelListing(uint256 tokenId) public {
        require(tokenSeller[tokenId] == msg.sender, "Only the seller can cancel the listing");
        require(tokenPrice[tokenId] > 0, "NFT is not listed");

        emit NFTListingCanceled(tokenId, msg.sender);

        delete tokenPrice[tokenId];
        delete tokenSeller[tokenId];
    }
}
