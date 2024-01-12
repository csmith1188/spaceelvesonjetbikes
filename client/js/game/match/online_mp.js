/*
      ::::::::  ::::    ::: :::        ::::::::::: ::::    ::: ::::::::::            :::   :::   :::    ::: :::    ::::::::::: ::::::::::: :::::::::  :::            :::   :::   ::: :::::::::: :::::::::
    :+:    :+: :+:+:   :+: :+:            :+:     :+:+:   :+: :+:                  :+:+: :+:+:  :+:    :+: :+:        :+:         :+:     :+:    :+: :+:          :+: :+: :+:   :+: :+:        :+:    :+:
   +:+    +:+ :+:+:+  +:+ +:+            +:+     :+:+:+  +:+ +:+                 +:+ +:+:+ +:+ +:+    +:+ +:+        +:+         +:+     +:+    +:+ +:+         +:+   +:+ +:+ +:+  +:+        +:+    +:+
  +#+    +:+ +#+ +:+ +#+ +#+            +#+     +#+ +:+ +#+ +#++:++#            +#+  +:+  +#+ +#+    +:+ +#+        +#+         +#+     +#++:++#+  +#+        +#++:++#++: +#++:   +#++:++#   +#++:++#:
 +#+    +#+ +#+  +#+#+# +#+            +#+     +#+  +#+#+# +#+                 +#+       +#+ +#+    +#+ +#+        +#+         +#+     +#+        +#+        +#+     +#+  +#+    +#+        +#+    +#+
#+#    #+# #+#   #+#+# #+#            #+#     #+#   #+#+# #+#                 #+#       #+# #+#    #+# #+#        #+#         #+#     #+#        #+#        #+#     #+#  #+#    #+#        #+#    #+#
########  ###    #### ########## ########### ###    #### ##########          ###       ###  ########  ########## ###     ########### ###        ########## ###     ###  ###    ########## ###    ###
*/
class Match_OnlineMP extends Match {
    constructor() {
        super();
    }

    /*

     #####  ######  ####  ###### #####
     #    # #      #      #        #
     #    # #####   ####  #####    #
     #####  #           # #        #
     #   #  #      #    # #        #
     #    # ######  ####  ######   #

    */
    reset() {
        super.reset();

    }

    /*

      ####  ###### ##### #    # #####
     #      #        #   #    # #    #
      ####  #####    #   #    # #    #
          # #        #   #    # #####
     #    # #        #   #    # #
      ####  ######   #    ####  #

    */
    setup() {
        super.setup();

        this.socket = new WebSocket('ws://localhost:3000');
        this.socket.binaryType = 'arraybuffer';

        // Event listener for WebSocket connection
        this.socket.addEventListener('open', (event) => {
            //get event's IP
            console.log('WebSocket connection opened');
        });

        // Event listener for WebSocket connection close
        this.socket.addEventListener('close', (event) => {
            console.log('WebSocket connection closed');
        });

        // Event listener for receiving messages
        this.socket.addEventListener('message', (event) => {
            const data = decodeWS(event);
            switch (data.type) {
                case 'player_id':
                    game.player.character.id = data.id;
                    break;
                case 'gamePause':
                    game.paused = data.value;
                    break;
                case 'playerList':
                    for (const player of data.players) {
                        if (player.id == game.player.character.id) continue;
                        let found = false;
                        for (const e of this.bots) {
                            if (e.character.id == player.id) {
                                e.character.HB = player.HB;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            this.bots.push(new Bot());
                            this.bots[this.bots.length - 1].findTarget = () => { };
                            this.bots[this.bots.length - 1].character.id = player.id;
                        }
                    }
                    // remove each bot from the bot list that does not have an id in the data.players
                    for (let i = this.bots.length - 1; i >= 0; i--) {
                        let found = false;
                        for (const player of data.players) {
                            if (player.id == this.bots[i].character.id) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            this.bots.splice(i, 1);
                        }
                    }
                    break;
                case 'update_cl_buttons':
                    // for each player and bots in this match
                    for (const e of [game.player, ... this.bots]) {
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
        });

        // this.bots.push(new Bot());
        // this.bots[this.bots.length - 1].findTarget = () => { };
        game.player.character.controller = new DummyController(game.player);

    }

    step() {
        // super.step();

        // update the ticks
        this.ticks++;

        // Get updates from the user

        let con = game.player.controller; // I just don't want to type this out every time

        con.deltaButtons = {};

        for (const key in con.buttons) {
            if (con.buttons[key].current !== con.buttons[key].last) {
                con.deltaButtons[key] = con.buttons[key].current;
            }
        }

        if (Object.keys(con.deltaButtons).length) {
            this.socket.send(JSON.stringify({
                type: 'update_cl_buttons',
                id: game.player.character.id,
                buttons: con.deltaButtons
            }));
        }

        game.player.character.step();

    }

    /*

     #####  #####    ##   #    #
     #    # #    #  #  #  #    #
     #    # #    # #    # #    #
     #    # #####  ###### # ## #
     #    # #   #  #    # ##  ##
     #####  #    # #    # #    #

    */
    draw() {
        super.draw();

    }
}