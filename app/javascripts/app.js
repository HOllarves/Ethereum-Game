// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import game_artifacts from '../../build/contracts/Game.json';

// Game is our usable abstraction, which we'll use through the code below.
var Game = contract(game_artifacts);
// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.

var accounts;
var account;

window.App = {
  start: function () {
    var self = this;
    // Bootstrap the Game abstraction for Use.
    Game.setProvider(web3.currentProvider);
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }
      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }
      accounts = accs;
      account = accounts[0];
      self.available_games = [];
      self.guessed_games = [];
      self.refreshBalance();
    });
  },
  setStatus: function (message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },
  refreshBalance: function () {
    var self = this;
    Game.deployed().then((instance) => {
      return instance.getBalance.call(account, { from: account });
    }).then((value) => {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf() / 1000000000000000000;
    }).catch((e) => {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  getGames: function () {
    var self = this;
    self.available_games = []
    Game.deployed().then((instance) => {
      return instance.getGamesAddr()
    }).then((games) => {
      if (games.length > 0) {
        Game.deployed().then((instance) => {
          games.forEach((game, idx, arr) => {
            instance.getGame(game)
              .then((_game) => {
                if (_game[2] == false) {
                  self.available_games.push({ id: game, name: _game[0], reward: _game[1].valueOf(), status: _game[2] });
                }
                if (game == account) {
                  self.my_game = { id: game, name: _game[0], reward: _game[1].valueOf(), finished: _game[2] };
                  self.setMyGame();
                }
                if (idx == arr.length - 1) {
                  self.setTable(self.available_games);
                }
              })
          })
        })
      }
    })
  },

  setMyGame: function () {
    var self = this;
    if (self.my_game) {
      if (self.my_game_list) {
        self.my_game_list.parentNode.removeChild(self.my_game_list);
      }
      self.my_game_list = document.createElement('ul');
      Object.entries(self.my_game).forEach(([key, val]) => {
        self.my_game_list.appendChild(document.createElement('br'));
        let game_prop = document.createElement('h3');
        let game_val = document.createElement('li');
        game_prop.innerHTML = key;
        self.my_game_list.appendChild(game_prop);
        game_val.appendChild(document.createTextNode(val));
        self.my_game_list.appendChild(game_val);
      })
      let list_container = document.getElementById("my_game");
      list_container.appendChild(self.my_game_list);
    }
  },

  getGameCount: function () {
    var self = this;
    Game.deployed().then((instance) => {
      return instance.countGames();
    }).then((count) => {
      console.log("Count: ", count)
    })
  },

  setTable: function (games) {
    var self = this;
    if (games.length > 0) {
      self.table = document.getElementById("games");
      if (self.table) {
        let tbody = self.table.childNodes[1];
        while (tbody.childNodes.length > 2) { tbody.removeChild(tbody.lastChild); }
      }
      for (let i = 0; i < games.length; i++) {
        if (games[i].id != account) {
          let row = self.table.insertRow();
          let game_name = row.insertCell();
          let game_reward = row.insertCell();
          let guess_input = row.insertCell();
          let btn = document.createElement('input');
          btn.type = "button";
          btn.className = "btn btn-sm";
          btn.onclick = (event) => { self.makeGuess() };
          game_name.innerHTML = games[i].name;
          game_reward.innerHTML = (games[i].reward / 1000000000000000000).toString() + " ETH";
          guess_input.innerHTML = "<input type='number' id='" + games[i].id + "' onblur=App.addGuess('" + games[i].id + "'," + games[i].reward + ")>";
        }
      }
    }
  },

  addGuess: function (guess_id, reward) {
    var self = this;
    let guess_input = document.getElementById(guess_id);
    let new_guess = guess_input.value;
    if (self.guessed_games && self.guessed_games.length > 0) {
      let found = false;
      self.guessed_games.forEach((_guess, idx, arr) => {
        if (_guess.id == guess_id) {
          _guess.value = parseInt(new_guess);
          _guess.reward = parseFloat(reward);
          found = true;
        }
        if (idx == arr.length - 1 && !found) {
          self.guessed_games.push({ id: guess_id, value: parseInt(new_guess), reward: parseFloat(reward) });
        }
      });
    } else {
      self.guessed_games.push({ id: guess_id, value: parseInt(new_guess), reward: parseFloat(reward) });
    }
  },

  guessGames: function (game_id, guess) {
    var self = this;
    if (self.guessed_games && self.guessed_games.length > 0) {
      Game.deployed().then((instance) => {
        self.guessed_games.forEach(guessed => {
          instance.guessGame.sendTransaction(guessed.id, guessed.value, { from: account, value: guessed.reward })
            .then(response => {
              self.setStatus("Guesses were made! Check your balance!")
            })
        });
      })
    }
  },

  cashOut: function () {
    var self = this;
    Game.deployed().then((instance) => {
      return instance.cashOut({ from: account })
    }).then(done => {
      self.setStatus("Cashed out!")
    }).catch(err => {
      console.log("Error: ", err)
      self.setStatus("Unable to cash out. Check logs!")
    })
  },

  createGame: function () {
    var self = this;
    var name = document.getElementById("name").value;
    var guess = parseInt(document.getElementById("guess").value);
    var reward = parseInt(document.getElementById("reward").value) * 1000000000000000000;
    this.setStatus("Starting Game... (please wait)");
    if (name && guess && reward) {
      Game.deployed().then((instance) => {
        return instance.createGame.sendTransaction(name, guess, { from: account, value: reward });
      }).then(() => {
        self.setStatus("Transaction complete!");
        self.refreshBalance();
      }).catch((e) => {
        console.log(e);
        self.setStatus("Error creating game; see log.");
      });
    } else {
      self.setStatus("Form values are missing");
    }
  }
};

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 Game, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }
  App.start();
});
