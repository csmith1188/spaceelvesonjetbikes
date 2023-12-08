<!--
      ::::::::   ::::::::  :::::::::  ::::::::::          ::::::::   ::::::::  ::::    :::  ::::::::  :::::::::: ::::::::: :::::::::::
    :+:    :+: :+:    :+: :+:    :+: :+:                :+:    :+: :+:    :+: :+:+:   :+: :+:    :+: :+:        :+:    :+:    :+:
   +:+        +:+    +:+ +:+    +:+ +:+                +:+        +:+    +:+ :+:+:+  +:+ +:+        +:+        +:+    +:+    +:+
  +#+        +#+    +:+ +#++:++#:  +#++:++#           +#+        +#+    +:+ +#+ +:+ +#+ +#+        +#++:++#   +#++:++#+     +#+
 +#+        +#+    +#+ +#+    +#+ +#+                +#+        +#+    +#+ +#+  +#+#+# +#+        +#+        +#+           +#+
#+#    #+# #+#    #+# #+#    #+# #+#                #+#    #+# #+#    #+# #+#   #+#+# #+#    #+# #+#        #+#           #+#
########   ########  ###    ### ##########          ########   ########  ###    ####  ########  ########## ###           ###
-->
Space elves believe nothing is random:
    No RNG in the mechanics. Main play mode can be reliably speedran.
Dark elves believe everything is random:
    The mechanics should be so fun that players will make their
    own games in completely randomly generated maps and scenarios.

<!--
      :::::::::   ::::::::          :::::::::: ::::::::::: :::::::::   :::::::: :::::::::::
     :+:    :+: :+:    :+:         :+:            :+:     :+:    :+: :+:    :+:    :+:
    +:+    +:+ +:+    +:+         +:+            +:+     +:+    +:+ +:+           +:+
   +#+    +:+ +#+    +:+         :#::+::#       +#+     +#++:++#:  +#++:++#++    +#+
  +#+    +#+ +#+    +#+         +#+            +#+     +#+    +#+        +#+    +#+
 #+#    #+# #+#    #+#         #+#            #+#     #+#    #+# #+#    #+#    #+#
#########   ########          ###        ########### ###    ###  ########     ###
-->

- Blocks and polyblocks with a top and side texture, and transparency if behind
- Block/polyblock footprint, then render upwards by z hover and z height
- Will they also hover?
- Make a pathing grid on map load that determines if any blocks are in each grid square
- use A* pathing with grid
- Universal block and polyblock collider function
- Complete speed physics (acceleration, top speed, actual speed, friction/weight)


- Fix X/Y npc movement
- Camera Zoom/Pan/Shake
- Only draw in camera
- Tilemaps
- Tilemap to collision blocks
- Foot Physics



- block heights
- hitboxes (graphics can be bigger than collision area)
    -- hitbox and graphic should just both be blocks attached to the x.y position of the character
    -- if blocks have parents, and another collider hits the hitbox, send the damage to the hitbox parent
- depth / z height affects render order
- particle block / dispenser block
- animators