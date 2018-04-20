pragma solidity ^0.4.17;

/**
    Simple Game smart contract for 
    School Of AI Descentralized Applications course.
    Author: Henry Ollarves

    About the game:
    This is a simple game in which 2 players interact with a smart contract.
    Player 1 makes a guess challenge in which he sets a reward in ether and a number between 1-10 to be guessed
    by possible competitors. Player 2 accepts Player1 (or any player) challenge by making a guess and matching the eth
    commited by Player1 in the challenge.

    Both Players can check their smart contract balances at all time and cashout their balances to their respective accounts.

    A player can only create 1 challenge per address, and can play any amount of challenges.

    When Player 2 makes a guess, he/she can win by guessing the exact number, one unit above or one unit below.
 */

contract Game {

    // Smart Contract creator - A man has to pay his bills
	address public creator;
    address[] public gameCreators;
    
    // Game struct with basic properties
    struct GameObj {
        string name;
        uint reward;
        bool finished;
        uint guess;
        bool isValue;
    }

    // List of all available games
    mapping (address => GameObj) public games;
    // List of all internal balances
    mapping (address => uint) public balances;

    function constructor() public { creator = msg.sender; }
    
    /**
        Creates a new game
        {uint} guess - Input by game creator. Number between 1-10
     */
    function createGame(string name, uint guess) public payable {
        assert(msg.value > 0);
        if (balances[msg.sender] != 0) { 
            cashOut();
            balances[msg.sender] = msg.value;
        } else { 
            balances[msg.sender] = msg.value;
        }
        if (games[msg.sender].isValue == false) {
            gameCreators.push(msg.sender);
        }
        games[msg.sender].reward = msg.value;
        games[msg.sender].name = name;
        games[msg.sender].guess = guess;
        games[msg.sender].finished = false;
        games[msg.sender].isValue = true;
    }

    /**
        Challenges an existing game.
        The game's reward must be matched in order to successfully execute
        {address} - gameCreator. Game creator to be challenged
        {uint} - guess. The guess input by the challenger.
     */
    function guessGame(address gameCreator, uint guess) public payable {

        assert(msg.value == games[gameCreator].reward && games[gameCreator].finished == false);
        assert(guess > 0 && guess <= 10);

        balances[msg.sender] = msg.value;

        if (games[gameCreator].guess == guess || games[gameCreator].guess == guess - 1 || games[gameCreator].guess == guess + 1) {
            transfer(games[gameCreator].reward, gameCreator, msg.sender);
        } else {
            transfer(games[gameCreator].reward, msg.sender, gameCreator);
        }
        
        games[gameCreator].finished = true;
    }

    /**
        Handle players balances
        {uint} amount - Amount of ether to be transfered
        {address} sender - Sender of funds
        {address} reciever - Reciever of funds
     */
    function transfer(uint amount, address sender, address reciever) private {
        // check sender balance is less than of amount which he wants to send.
        if (balances[msg.sender] < amount) {
            return;
        }
        // decrease sender's balance. 
        balances[sender] = balances[sender] - amount;
        // increase reciever's balance.
        balances[reciever] = balances[reciever] + amount;
    }

    /**
        Allows players to cash out their balances.
     */
    function cashOut() public {
        assert(balances[msg.sender] > 0);
        require(msg.sender.send(balances[msg.sender]));
        balances[msg.sender] = 0;
        if (games[msg.sender].finished == false) {
            games[msg.sender].finished = true;
        }
    }

    /**
        Returns a specific address balance
     */
    function getBalance(address addr) public  view returns (uint) {
        return balances[addr];
    }

    /**
        Return available games
     */
     function getGamesAddr() public view returns (address[]) {
         return gameCreators;
     }

    /**
        Returns a specific game
        {address} addr - address of the game
     */
     function getGame(address addr) view public returns (string, uint, bool) {
         return(games[addr].name, games[addr].reward, games[addr].finished);
     }

    /**
        Returns the amount of games
     */
     function countGames() view public returns (uint) {
         return gameCreators.length;
     }
}