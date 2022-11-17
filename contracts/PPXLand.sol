// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ILayerZeroEndpoint {
    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;

    function estimateFees(
        uint16 _dstChainId,
        address _userApplication,
        bytes calldata _payload,
        bool _payInZRO,
        bytes calldata _adapterParam
    ) external view returns (uint256 nativeFee, uint256 zroFee);
}

contract PPXLand is ERC721, Ownable {
    uint256 private _lock = 1;
    uint256 internal _id;
    ILayerZeroEndpoint public immutable lzEndpoint;

    mapping(uint16 => bytes) public trustedRemoteLookup;
    event SetTrustedRemote(uint16 _remoteChainId, bytes _path);

    struct Assets {
        address owner;
        uint256[] ids;
    }
    event CrossEvent(address from, uint16 chainId, uint256[] ids);

    constructor(address _endpoint) ERC721("PPXLand", "PPXL") {
        lzEndpoint = ILayerZeroEndpoint(_endpoint);
    }

    modifier lock() {
        require(_lock == 1, "LOCKED");
        _lock = 2;
        _;
        _lock = 1;
    }

    function totalSupply() external view returns (uint256) {
        return _id;
    }

    function crossChain(
        address _receiver,
        uint16 _dstChainId,
        uint256[] calldata _ids,
        bytes memory _adapterParams
    ) external payable lock {
        uint256 len = _ids.length;

        unchecked {
            for (uint256 i = 0; i < len; ) {
                uint256 id = _ids[i];
                require(
                    ownerOf(id) == msg.sender,
                    "not token owner nor approved"
                );

                _transfer(msg.sender, address(this), id);
                ++i;
            }
        }
        bytes memory _payload = abi.encode(Assets(_receiver, _ids));

        lzEndpoint.send{value: msg.value}(
            _dstChainId,
            trustedRemoteLookup[_dstChainId],
            _payload,
            payable(msg.sender),
            address(this),
            _adapterParams
        );
        emit CrossEvent(msg.sender, _dstChainId, _ids);
    }

    function lzReceive(
        uint16 _srcChainId,
        bytes calldata _srcAddress,
        uint64,
        bytes calldata _payload
    ) public virtual {
        require(
            _msgSender() == address(lzEndpoint),
            "LzApp: invalid endpoint caller"
        );

        bytes memory trustedRemote = trustedRemoteLookup[_srcChainId];
        require(
            _srcAddress.length == trustedRemote.length &&
                trustedRemote.length > 0 &&
                keccak256(_srcAddress) == keccak256(trustedRemote),
            "LzApp: invalid source sending contract"
        );

        Assets memory assets = abi.decode(_payload, (Assets));

        uint256[] memory ids = assets.ids;
        uint256 len = ids.length;
        uint256 total = _id;
        unchecked {
            for (uint256 i = 0; i < len; ) {
                uint256 id = ids[i];
                if (_exists(id)) {
                    require(
                        ownerOf(id) == address(this),
                        "The current ID is abnormal"
                    );
                    _transfer(address(this), assets.owner, id);
                } else {
                    _mint(assets.owner, id);
                    ++total;
                }
                ++i;
            }
            _id = total;
        }
        emit CrossEvent(address(this), _srcChainId, ids);
    }

    function estimateFees(
        uint16 _dstChainId,
        address _userApplication,
        Assets memory _assets,
        bytes memory _adapterParams
    ) external view returns (uint256 fee) {
        bytes memory _payload = abi.encode(_assets);
        (fee, ) = lzEndpoint.estimateFees(
            _dstChainId,
            _userApplication,
            _payload,
            false,
            _adapterParams
        );
    }

    function setTrustedRemote(uint16 _srcChainId, bytes calldata _path)
        external
        onlyOwner
    {
        trustedRemoteLookup[_srcChainId] = _path;
        emit SetTrustedRemote(_srcChainId, _path);
    }
}
