// SPDX-License-Identifier: MIT
//
// AnotherWorldVault
// ETH Global Hackathon SF
//
// This is a treasure vault to manage in-game erc20/1155 drops (mint/transfer) in-game items
// The game server owns vaultOperator wallet can mint in-game items to players.
// This vault can receive external erc20/1155 tokens then to be airdropped to players.
//

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// external erc20 tokens
abstract contract BaseErc20 {
    function balanceOf(address account) public virtual returns (uint256);
    function transfer(address recipient, uint256 amount) public virtual;
    function transferFrom(address sender, address recipient, uint256 amount) public virtual returns (bool);
}

// external erc1155 tokens
abstract contract BaseErc1155 {
    function balanceOf(address account, uint256 id) public virtual returns (uint256);
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) public virtual;
}

contract AnotherWorldVault is ERC1155, IERC1155Receiver, Ownable {
    string public name;
    string public symbol;
    string public baseUri;
    BaseErc20 private token20;
    BaseErc1155 private token1155;

    bool public _isLocked = false;
    address public vaultOperator;

    constructor() ERC1155("") {
        name = "Another World Vault";
        symbol = "AWORLD";
        vaultOperator = msg.sender;
    }

    event Received(address, uint256);
    event Minted(address, uint256, uint256);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function setURI(string memory newuri) public onlyOwner {
        baseUri = newuri;
    }

    function uri(uint256 tokenId) public override view returns (string memory) {
        return string(abi.encodePacked(baseUri, Strings.toString(tokenId), ".json"));
    }

    function setvaultOperator(address newOperator) public onlyOwner {
        vaultOperator = newOperator;
    }

    function mint(address account, uint256 id, uint256 amount)
        public
    {
        require(!_isLocked, "vault locked");
        require(msg.sender == vaultOperator, "invalid operator"); // only vaultOperator can mint
        _mint(account, id, amount, "");
        emit Minted(account, id, amount);
    }

    function toggleLock(bool locked) public onlyOwner {
        _isLocked = locked;
    }

    function transferErc20Token (address erc20Address, address to, uint256 amount) external onlyOwner {
        require(!_isLocked, "vault locked");
        token20 = BaseErc20(erc20Address); 
        require(token20.balanceOf(address(this)) >= amount, "not enough balance");
        token20.transfer(to, amount);
    }

    function transferErc1155Token (address erc1155Address, address to, uint256 tokenId, uint256 amount) external onlyOwner {
        require(!_isLocked, "vault locked");
        token1155 = BaseErc1155(erc1155Address);
        uint256 balance = token1155.balanceOf(msg.sender, tokenId);
        require(balance >= amount, "invalid erc1155 token amount");
        token1155.safeTransferFrom(address(this), to, tokenId, amount, ""); // 1155 needs to approve token spending from caller
    }

    function withdrawErc20(address erc20Address) external onlyOwner {
        token20 = BaseErc20(erc20Address); 
        token20.transfer(msg.sender, token20.balanceOf(address(this)));
    }

    function withdrawErc1155(address erc1155Address, uint256 tokenId) external onlyOwner {
        token1155 = BaseErc1155(erc1155Address);
        uint256 balance = token1155.balanceOf(address(this), tokenId);
        require(balance >= 0, "invalid erc1155 token amount");
        token1155.safeTransferFrom(address(this), msg.sender, tokenId, balance, ""); // 1155 needs to approve token spending from caller
    }

    function withdraw() external payable onlyOwner {
        require(payable(msg.sender).send(address(this).balance));
    }

    function onERC1155Received(
        address, 
        address, 
        uint256,
        uint256, 
        bytes calldata
    )external override pure returns(bytes4) {
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    function onERC1155BatchReceived(
        address, 
        address, 
        uint256[] calldata,
        uint256[] calldata, 
        bytes calldata
    )external override pure returns(bytes4) {
        return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));
    }  
    
    function random() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
    }

    function isApprovedForAll(
        address _owner,
        address _operator
    ) public override view returns (bool isOperator) {
       // vaultOperator address can move minted 1155 tokens
       if (_operator == vaultOperator) {
            return true;
        }
        // otherwise, use the default ERC1155.isApprovedForAll()
        return ERC1155.isApprovedForAll(_owner, _operator);
    }
}