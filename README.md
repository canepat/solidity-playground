[![Build Status](https://travis-ci.com/canepat/solidity-playground.svg?branch=master)](https://travis-ci.com/canepat/solidity-playground)

# Solidity Playground

The source code for the Ethereum smart contracts animating my Solidity playground.



## Overview

The following sections are present:



## Installation

Install Truffle and SolcJS

```bash
npm install -g truffle     // Version 4.1.11+ required
npm install -g solc        // Version 0.4.24+ required
```

Install Solc

```bash
sudo add-apt-repository ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install solc
which solc
solc --version             // Version 0.4.24+ required
```

Install dependencies
 
```bash
npm install
```



## Start Truffle

```bash
truffle develop
```



## Compile and migrate
Inside truffle develop
  
```bash
compile 
migrate
```
 
 
 
## Test 
Inside truffle develop
  
```bash
test
```


View [test results(TBD)](https://github.com/canepat/solidity-playground/blob/master/test/results/test-results.md)



## Optional


### Flattener


Install [Truffle Flattener](https://github.com/alcuadrado/truffle-flattener)

```bash
npm install truffle-flattener -g
```
 
Usage
 
```bash
truffle-flattener contracts/<Contract>.sol > dist/<Contract>.sol

solc --bin --abi --optimize --overwrite -o dist/build/ dist/<Contract>.sol
```


### Linter

Install the [Solium linter](https://github.com/duaraghav8/Solium)

```bash
npm install -g solium
```

Usage

```bash
solium -d contracts
```


## Helpful Links
 
Solidity [Doc](https://solidity.readthedocs.io) [GitHub](https://github.com/ethereum/solidity)
 
Truffle [Doc](http://truffleframework.com/docs/) [GitHub](https://github.com/trufflesuite/truffle)
 
OpenZeppelin [Doc](http://zeppelin-solidity.readthedocs.io) [GitHub](https://github.com/OpenZeppelin)

Web3.js [Doc](http://web3js.readthedocs.io/en/1.0/index.html) [GitHub](https://github.com/ethereum/web3.js/)



## Bugs and Issues

Have a bug? [Open a new issue](https://canepat/solidity-playground/issues).

