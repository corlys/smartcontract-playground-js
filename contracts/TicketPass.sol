pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TicketPass is ERC721URIStorage, Ownable {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;

    /* Stage 0: Pause
     *  Stage 1: Private Sale Start
     *  Stage 2: Pause
     *  Stage 3: Public sale start
     *  Stage 4: Pause
     */
    enum Stage {
        Stage0,
        Stage1,
        Stage2,
        Stage3,
        Stage4
    }
    uint256 public constant PRIV_SALE_PRICE = 0.02 ether;
    uint256 public constant PUBL_SALE_PRICE = 0.05 ether;
    uint256 public DEV_LIMIT;
    uint256 public PRIVATE_SUPPLY;
    uint256 public PUBLIC_SUPPLY;
    uint256 public REMAINING_SUPPLY;
    uint256 TOTAL_SUPPLY;
    uint256 public constant MAX_SUPPLY = 11100;
    address private constant WALLET_1 =
        0x9990c57Ef6BF16490FA390709E135BE050E42B94;
    address private constant WALLET_2 =
        0x74b9acA2e211FfAA7e1634B20d3D029F76b9a61C;
    address private constant WALLET_3 =
        0x9D5aad34a9045a9402E1Cff1B65A62b2071043AC;
    address private constant WALLET_4 =
        0x398b5A38fe9a5747fE8139eEDae558575cC68381;
    address private constant WALLET_5 =
        0x9209a04a5bebdc068D0632EC828Ed597364ce3E6;
    address private constant WALLET_6 =
        0x96355F34D24a5E345f75FfFB87B661B65542e91B;

    Stage public stage;

    event Mint(address indexed minter, uint256 amount);

    mapping(address => uint256) public WhitelistWallet;
    mapping(address => bool) public DevWallet;
    mapping(uint256 => string) private tokenUriMapping;

    constructor() ERC721("JUKIVERSE", "JUKI") {
        stage = Stage.Stage0;
        DEV_LIMIT = 100;
        PRIVATE_SUPPLY = 1000;
        PUBLIC_SUPPLY = 10000;
        DevWallet[owner()] = true;
        WhitelistWallet[WALLET_1] = 10;
        WhitelistWallet[WALLET_2] = 10;
        WhitelistWallet[WALLET_3] = 10;
        WhitelistWallet[WALLET_4] = 10;
        WhitelistWallet[WALLET_5] = 10;
        WhitelistWallet[WALLET_6] = 10;
    }

    function totalSupply() public view returns (uint256) {
        return TOTAL_SUPPLY;
    }

    /// NOTE: this function can only called by dev only, to call this
    ///       function the wallet need to be added as dev wallet first
    function devMint(
        address _to,
        uint256 _amount,
        string calldata _tokenURI
    ) external {
        require(DevWallet[msg.sender], "DEV_PERMISSION_FAILED");
        require(totalSupply() + _amount <= MAX_SUPPLY, "SUPPLY_EXCEDEED");
        DEV_LIMIT -= _amount;
        TOTAL_SUPPLY += _amount;
        for (uint256 index = 0; index < _amount; index++) {
            tokenIds.increment();
            _mint(_to, tokenIds.current());
            _setTokenURI(tokenIds.current(), _tokenURI);
        }
        emit Mint(msg.sender, _amount);
    }

    /// NOTE: mint NFT for private sale or whitelisted user
    /// @param _amount amount of NFT to be minted
    function PrivateSaleMint(uint256 _amount, string calldata _tokenURI)
        external
        payable
    {
        require(stage == Stage.Stage1, "INVALID_STAGE");
        require(_amount <= WhitelistWallet[msg.sender], "AMOUNT_TX_EXCEDEED");
        require(
            totalSupply() + _amount <= PRIVATE_SUPPLY,
            "PRIVATE_SUPPLY_EXCEDEED"
        );
        require(msg.value >= (PRIV_SALE_PRICE * _amount), "INSUFFICIENT_FUND");

        WhitelistWallet[msg.sender] -= _amount;
        REMAINING_SUPPLY -= _amount;
        TOTAL_SUPPLY += _amount;
        for (uint256 index = 0; index < _amount; index++) {
            tokenIds.increment();
            _mint(msg.sender, tokenIds.current());
            _setTokenURI(tokenIds.current(), _tokenURI);
        }
        emit Mint(msg.sender, _amount);
    }

    /// NOTE: Mint NFT for public sale
    function publicMint(uint256 _amount, string memory _tokenURI)
        external
        payable
    {
        require(stage == Stage.Stage3, "INVALID_STAGE");
        require(_amount <= 5, "AMOUNT_TX_EXCEDEED");
        require(
            totalSupply() + _amount <= PUBLIC_SUPPLY,
            "PUBLIC_SUPPLY_EXCEDEED"
        );
        require(totalSupply() + _amount <= MAX_SUPPLY, "MAX_SUPPLY_EXCEDEED");
        require(msg.value >= (PUBL_SALE_PRICE * _amount), "INSUFFICIENT_FUND");

        TOTAL_SUPPLY += _amount;
        for (uint256 index = 0; index < _amount; index++) {
            tokenIds.increment();
            _mint(msg.sender, tokenIds.current());
            _setTokenURI(tokenIds.current(), _tokenURI);
        }

        emit Mint(msg.sender, _amount);
    }

    /* NOTE: to proceed to next stage
     *        this will check the stage and change it
     *        after it reach stage 4 the remaining supply
     *        will be resetted to 0 and will use DEV_LIMIT
     *        to indicate how many supplies left.
     */
    function upStage() external onlyOwner {
        if (stage == Stage.Stage0) {
            REMAINING_SUPPLY = PRIVATE_SUPPLY;
            stage = Stage.Stage1;
        } else if (stage == Stage.Stage1) {
            stage = Stage.Stage2;
        } else if (stage == Stage.Stage2) {
            REMAINING_SUPPLY = REMAINING_SUPPLY + PUBLIC_SUPPLY;
            stage = Stage.Stage3;
        } else if (stage == Stage.Stage3) {
            REMAINING_SUPPLY = 0;
            DEV_LIMIT = DEV_LIMIT + REMAINING_SUPPLY;
            stage = Stage.Stage4;
        }
    }

    /// NOTE: function to add wallet as a dev wallet
    ///       dev wallet is needed to call devmint
    /// @param _devWallet address that will be added as a dev wallet
    function addDevWallet(address _devWallet) external onlyOwner {
        require(_devWallet != address(0), "INVALID_ADDRESS");
        DevWallet[_devWallet] = true;
    }

    /// NOTE: function to add whitelisted address
    /// @param _whitelistAddress address that will be added to whitelist
    /// @param _allocation how many nft can be minted while in private sale
    function addWhitelist(address _whitelistAddress, uint256 _allocation)
        external
        onlyOwner
    {
        require(_whitelistAddress != address(0), "INVALID_ADDRESS");
        WhitelistWallet[_whitelistAddress] = _allocation;
    }

    /// NOTE: this function is for sending the ethers to the desired wallet
    /// @param recipient is filled with the one who will receive the ethers
    /// @param amount is filled with how many ethers (in wei) that will be sent
    function sendEther(address payable recipient, uint256 amount) internal {
        require(
            address(this).balance >= amount,
            "Address: insufficient balance"
        );

        (bool success, ) = recipient.call{value: amount}("");
        require(
            success,
            "Address: unable to send value, recipient may have reverted"
        );
    }

    function withdrawAll() external onlyOwner {
        require(
            stage == Stage.Stage2 || stage == Stage.Stage4,
            "STAGE_STILL_ONSALE"
        );
        require(address(this).balance > 0, "BALANCE_ZERO");
        uint256 walletABalance = (address(this).balance * 50) / 100;
        uint256 walletBBalance = (address(this).balance * 15) / 100;
        uint256 walletCBalance = (address(this).balance * 35) / 100;

        sendEther(payable(WALLET_1), walletABalance);
        sendEther(payable(WALLET_2), walletBBalance);
        sendEther(payable(WALLET_6), walletCBalance);
    }
}
