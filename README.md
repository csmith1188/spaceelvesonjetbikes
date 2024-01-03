# Space Elves on Jetbikes
## For Speed. For Honor. Forever.
Far away in the galaxy, a race of elves from outer space roam the stars and planets, mounted on their lightning-fast jetbikes. Their eternal race is a beacon of values that us mere humans can barely comprehend, such as speed, and honor.

In the darkest shadows of the galaxy, those who have strayed from these mores lurk. The Dark Elves seek to defile that which is revered by the Space Elves, and use their gifts for their own short-term gains.

As a valiant knight of the Space Elves, you are to defeat these Dark Elves in the immortal battlefields of speed and honor.

### Scope

SEJB is a 2.5D Javascript game that avoids using additional modules not found in the typical web browser out of the box. The client of the game should be able to run entirely in a single web page. In the future, the server for multiplayer will require nodeJS, but will also minimize extraneous modules not found in nodeJS.

The purpose of this is to demonstrate the core principals of game design, allowing developers direct access to the nuts and bolts. If you are going to learn about game design, you should be looking at the algorithms that make it happen, instead of memorizing an engine API.

The game revolves around mounted racing and combat, but the engine can easily be retooled for many other types of games.

### Goals

- Full compatibility with Mouse/Keyboard, Touchscreen, and Gamepad.
 - Touchpad needs a lot of work
- Physics with speed, force, gravity, friction, and weight.
 - Everything works well, but can be refined
- 3 dimensional space in a 2 dimensional context.
 - 3D space is currently broken, especially since texturing is not handled by canvas
- Nav Mesh generation and A* pathfinding.
- Multiplayer via websockets
- AI Training

### License

Space Elves on Jetbikes is license under CC-BY-NC-SA-4.0, known as the __Creative Commons Attribution-NonCommercial-ShareAlike__ license.

You may:
- Download and use this software for free
- Modify this software for your own purposes
- Copy and distribute this and modified versions of this software for free
- Monetize the distribution of or the services provided by this software if it is _substantially different_ from the original, and credit is given to the author of _this_ original software

You may not:
- Monetize the distribution of this original software or services provided from it, if it is not substantially different
- Copy or distribute this software, or derivatives of it, without creditting the other of this software

In other words, you may not charge customers for access to a private online server for SEJB. You could, however, make a "Warehouse Orks on Pallete Jacks" game using this code and charge customers to play, as long as you credit the author of SEJB and provide links back to the github repo.