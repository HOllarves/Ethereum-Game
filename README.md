# Guess Stuff Make Dough

## Stack

For this project I used the Truffle framework which made the whole development process a lot easier. I also used Ganache to create my own private blockchain and use it's internal rpc for the development of this project.

## Set up

In order to run this dapp you must have the truffle framework installed as well as ganache.

To install truffle simply use: `npm install truffle -g`. This will install the truffle cli to your computer.

To download and install ganache go to this [link](http://truffleframework.com/docs/ganache/using).

After having both installed, run ganache and in the project's directory run: `truffle compile && truffle migrate`. This will compile and deploy the smart contract to your test blockchain. Afterwards simply run `npm run dev` to start local server and use the app (or should I say dapp) at http://localhost:8080

## Game Overview and rules

This is a simple game in which any user can post one challenge and try to guess as many challenges as they want. Challenges are simple, to win a player needs to guess a number decided by the challenge creator. If the challenger guesses the exact number, one above or one below, the challenger wins the challenge. Otherwise, the challenge creator wins. 

To create a challenge, a player decides a number and establishes a reward in ether. The ether is sent to the smart contract and the challenge information is stored in the blockchain.

To participate in a challenger, a player makes a guess and transfers the same amount of ether to the smart contract. This information is compared in the smart contract and the winner recieves a transfer to their internal balance.

All players have a internal balance in which they can see the amount of ether they have inside the smart contract.

At any time a player can cash out their ether out of the smart contract.

## Known bugs and problems encountered

Besides not using a frontend framework (which now I regret and it's my bad) I did encountered a lot of problems with truffle and the test rpc interactions. I had to restart ganache a lot, and debug network ids to make it all work. Although I must say that once I installed Ganache GUI, everything went A LOT smoother.

I also found that transactions are often rejected by lack of gas. I would love to know more on how to properly calculate gas usage and act accordingly.

I also still don't really understand how to use events to trigger stuff in my frontend. I would love to have a much more automatic way to load new games and balances without having to click on a button.




