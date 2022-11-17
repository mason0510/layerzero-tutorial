// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@layerzerolabs/solidity-examples/contracts/mocks/LZEndpointMock.sol";

contract LocalLZEndpoint is LZEndpointMock {
    constructor(uint16 _chainId) LZEndpointMock(_chainId) {}
}
