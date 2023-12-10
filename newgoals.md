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

- Complete speed physics (acceleration, top speed, actual speed, friction/weight)
- AABB Collision for 3d (and polyblocks as well)?
- Blocks and polyblocks with a top and side texture, and transparency if behind

- Tilemaps
- Make a pathing grid on map load that determines if any blocks are in each grid square
- Tilemap to collision blocks
- use A* pathing with grid

- Fix X/Y npc movement
- Only draw in camera
- Camera Zoom/Pan/Shake
- Foot Physics

- block heights
- hitboxes (graphics can be bigger than collision area)
    -- hitbox and graphic should just both be blocks attached to the x.y position of the character
    -- if blocks have parents, and another collider hits the hitbox, send the damage to the hitbox parent
- animators