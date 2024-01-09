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

        // Event listener for WebSocket connection
        socket.addEventListener('open', (event) => {
            console.log('WebSocket connection opened');
        });

        // Event listener for WebSocket connection close
        socket.addEventListener('close', (event) => {
            console.log('WebSocket connection closed');
        });

        // Event listener for receiving messages
        socket.addEventListener('message', (event) => {
            const data = decodeWS(event);
            // for each player and bots in this match
            for (const e of [game.player, ... this.bots]) {
                if (e.character.id == data.id) {
                    // for each button in the data
                    for (const button in data.buttons) {
                        e.character.controller.buttons[button].current = data.buttons[button];
                    }
                }
            }
        });

        this.bots.push(new Bot());
        this.bots[this.bots.length - 1].findTarget = () => { };
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
            socket.send(JSON.stringify({
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