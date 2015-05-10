Readme for Break Out
====================
Created: 27th April
Modified: 27th April
Author: Matt Barton
====================


Game summary
============
Break Out is a simple pong-like game with a goal of destroying as many bricks
as possible without letting the ball fall below the paddle at the bottom.
The ball will bounce off walls (and ceiling) and bricks as it hits them, breaking
the bricks as it does so and increasing a little counter.


Run instructions
================
Extract "Breakout (Matt).zip" and open "breakout.html" in the extracted folder with
a browser (Google Chrome, Firefox, Opera, etc), and the browser will do the rest.
If the game doesn't happen to load, ensure that Javascript is enabled.


Features
========
In this version, the following features have been implemented.

- The ball will get progressively faster with each ball that is hit. That means
  getting bricks gets progressively more difficult.
- The ball's direction will change relative to where on the paddle the ball hits.
  This introduces additional strategy to the game.
- There exists a challenge mode, where instead of bouncing off of the left and
  right walls, it teleports to the other side. This tiny change surprisingly makes
  the game significantly more difficult. This can be toggled before the game starts.
- The game can be paused with the 'p' key. This changes the game's state and doesn't
  allow any keyboard input to be entered, other than unpause (u).
- I decided to use images for the bricks, the paddle and the background as it became
  more interesting when I did so.
  

Difficulties
============
The most difficult part of this project was getting a collision between the ball and
the bricks to work. I ended up deciding to write a robust line-intersection detection
method, as this kept collisions smooth and it also allowed me to reuse some of the
wall collision methods with the brick collision ones. This would also have allowed me
to introduce a game mode with non-horizontal bricks if I chose to do so as well.

Once collision detection was sorted, the rest fell into place quite nicely.


Software used
=============
Geany - text editor
Photoshop - Creating images


Sources/References
==================
Basic HTML5 canvas tutorial I used to help get started
http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game

HTML5 Canvas Tutorials for things like drawing the ball
http://www.html5canvastutorials.com/tutorials/html5-canvas-circles/

Course lecture notes, for the support.L(A, B, C) method. Intersection was derived
from this.
