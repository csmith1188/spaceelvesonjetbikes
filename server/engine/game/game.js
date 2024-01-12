const Match = require('./match/match.js');
const { Bot, Player } = require('./player/player.js');
const { Jetbike } = require('./player/character.js');
const { Pistol } = require('./items.js');
const WebSocket = require('ws');
const utils = require('../utils.js');

class Game {
    constructor() {
        this.paused = false;
        this.awaitingInput = false;
        this.menu = null;
        this.debug = false;
        this.allID = 0;
        this.ticks = 0;
        this.maxPlayers = 30;
        this.players = [];
        this.match = new Match(this);

        // Handle WebSocket connections
        wss.on('connection', (ws) => {
            console.log('WebSocket connection established');

            if (this.players.length < this.maxPlayers) {
                this.players.push(new Player(this));
                this.players[this.players.length - 1].character = new Jetbike(
                    this.players[this.players.length - 1].character.id,
                    new utils.Vect3(0, 0, 0),
                    this.players[this.players.length - 1]);
                this.players[this.players.length - 1].character.inventory.push(new Pistol());
                this.players[this.players.length - 1].ws = ws;
                ws.send(utils.encodeWS({ type: 'player_id', id: this.players[this.players.length - 1].character.id }));
                this.broadcast(utils.encodeWS({ type: 'playerList', players: this.playerList() }));
            }

            // Handle messages from clients
            ws.on('message', (message) => {
                const data = JSON.parse(message);
                switch (data.type) {
                    case 'update_cl_buttons':
                        // for each player and bots in this match
                        for (const e of this.players) {
                            if (e.character.id == data.id) {
                                // for each button in the data
                                for (const button in data.buttons) {
                                    e.character.controller.buttons[button].current = data.buttons[button];
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
                this.broadcast(message);
            });

            // Handle WebSocket connection close
            ws.on('close', () => {
                console.log('WebSocket connection closed');
                this.players = this.players.filter((player) => player.ws !== ws);
                this.broadcast(utils.encodeWS({ type: 'playerList', players: this.playerList() }));
            });
        });
    }

    /*
          :::::::: ::::::::::: :::::::::: :::::::::
        :+:    :+:    :+:     :+:        :+:    :+:
       +:+           +:+     +:+        +:+    +:+
      +#++:++#++    +#+     +#++:++#   +#++:++#+
            +#+    +#+     +#+        +#+
    #+#    #+#    #+#     #+#        #+#
    ########     ###     ########## ###
    */

    step() {

        // Advance the game's master tick counter
        this.ticks++;

        // If there are no players, pause the game
        // if (!this.players.length) this.paused = true;

        // If the game is paused
        if (this.paused) {
            this.broadcast(utils.encodeWS({ type: 'gamePause', value: this.paused }));
        }

        // If the game is not paused and all controllers have been assigned, play the match
        else {
            this.match.step(); // Then step the match
            if (this.ticks % 1 == 0)
                this.broadcast(utils.encodeWS({ type: 'playerList', players: this.playerList() }));
        }
    }

    playerList() {
        let playerList = [];
        for (const player of this.players) {
            playerList.push({
                id: player.character.id,
                HB: player.character.HB,
                speed: player.character.speed
            });
        }
        return playerList;
    }

    broadcast(message, socket) {
        wss.clients.forEach((client) => {
            if (socket) {
                if (socket && client !== socket) {
                    if (client.readyState === WebSocket.OPEN) client.send(message);
                }
            }
            else {
                if (client.readyState === WebSocket.OPEN) client.send(message);
            }
        });
    }

}

module.exports = Game;