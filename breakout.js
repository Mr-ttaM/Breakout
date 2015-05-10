//################################################################################
//################################################################################
//#                                                                              #
//# ######    ######    ######  ######    ###  ###  ########  ########  ######## #
//# ###  ###  ###  ###  ###     ###  ###  ###  ###  ###  ###  ###  ###     ##    #
//# ######    ######    ######  ########  ######    ###  ###  ###  ###     ##    #
//# ###  ###  ###  ###  ###     ###  ###  ###  ###  ###  ###  ###  ###     ##    #
//# ######    ###  ###  ######  ###  ###  ###  ###  ########  ########     ##    #
//#                                                                              #
//############################################################################## #
//############################################################################## #

/**
 * Break Out
 * =========
 * A slight twist on game about a bouncing ball and breaking bricks. An old
 * classic pong-like paddle game that everyone knows and loves and probably
 * gets frustrated by
 * 
 * Created: April 24th
 * Modified: April 27th
 * Author: Matt Barton
 */

var game = {
    
    /**
     * Stores the canvas. This is set when the game is constructed (ie,
     * when the setup function is called)
     */
    canvas: null,
    
    /**
     * The context of the canvas. This is set when the game is constructed
     */
    context: null,
    
    
    /**
     * The current score for the game
     */
    score: 0,
    
    /**
     * Boolean indicating if Challenge mode is enabled.
     * 
     * Challenge Mode is when the ball phases through the wall and pops out on
     * the other side, opposed to bouncing off of it
     */
    challengeMode: false,
    
    
    /**
     * The main background for the canvas
     */
    backgroundImage: null,
    
    
    /**
     * Stores the time that the main loop previously executed, so the game can remain
     * smooth even if the play loop isn't running in constant time
     */
    previousTime: null,
    
    
    /**
     * An object for storing which keys are being pressed down. This is
     * managed and kept updated with keyboard event listeners
     */
    keysDown: {},
    
    
    // Variables used to control the state of the game
    /**
     * Indicates if the game is paused
     */
    isPaused: false,
    
    /**
     * Indicates if the game has started yet
     */
    isStarted: false,
    
    /**
     * Indicates if the game is over.
     */
    isOver: false,
    
    
    // Variables used to set the coordinate space of the game
    /**
     * The X-coordinate [(0, 0) at top left corner of canvas] to the center of the
     * paddle in it's starting position
     */
    coordinateOffsetX: null,
    
    /**
     * The Y-coordinate [(0, 0) at top left corner of canvas] o the center of the
     * paddle in it's starting position
     */
    coordinateOffsetY: null,
    
    
    /**
     * Adds event listeners to listen for keyboard inputs
     */
    addActionListeners: function() {
        
        addEventListener("keydown", function (e) {
            this.game.keysDown[e.keyCode] = true;
        }, false);

        addEventListener("keyup", function (e) {
            delete this.game.keysDown[e.keyCode];
        }, false);
        
    },
    
    /**
     * Loads the required images for the background, bricks and paddle
     */
    loadImages: function() {
        
        this.backgroundImage = support.loadImage("images/background.png");
        bricks.image = support.loadImage("images/brick.png");
        paddle.image = support.loadImage("images/paddle.png");
        
    },
    
    /**
     * Sets up the game, including creating a canvas, setting up the bricks,
     * creating a ball, resetting the score and state variables
     */
    setup: function() {
        this.canvas = document.getElementById("breakout");
        this.context = this.canvas.getContext("2d");

        this.coordinateOffsetX = this.canvas.width / 2;
        this.coordinateOffsetY = this.canvas.height - 10;
        
        // Resets everything
        this.previousTime = Date.now();
        
        bricks.populateBricks();
        paddle.offset = 0;
        ball.spawn();
        this.score = 0;
        
        this.isPaused = false;
        this.isStarted = false;
        this.isOver = false;
        
        this.addActionListeners();
        
        this.loadImages();
    },
    
    /**
     * Blacks out the screen with an opaque rectangle
     */
    blackOut: function() {
        
        // Blacks out the screen
        game.context.fillStyle = 'rgba(0,0,0,0.5)';
        game.context.fillRect(0,0,game.canvas.width,game.canvas.height);
        
    },
    
    /**
     * Overlays an appropriate message based on the game's current state
     */
    messageOverlay: function() {
        // If the game hasn't yet started
        if (!this.isStarted) {
            
            this.blackOut();
            
            this.showBigMessage("Press space to begin");
            
            if (this.challengeMode) {
                
                this.showLittleMessage("Challenge Mode enabled. Press d to disable");
                
            }
            else {
                
                this.showLittleMessage("Challenge Mode disabled. Press e to enable");
                
            }
            
        }
        else if (this.isPaused) {
            
            this.blackOut();
            
            this.showBigMessage("Paused!");
            this.showLittleMessage("Press 'u' to unpause");
            
        }
        else if (this.isOver) {
            
            this.blackOut();
            
            if (this.score < 10) {
                this.showBigMessage("Better luck next time");
            }
            else if(this.score < 20) {
                this.showBigMessage("Good attempt!");
            }
            else if(this.score < 30) {
                this.showBigMessage("So close!");
            }
            else if (this.score < 40) {
                this.showBigMessage("You pretty much won!");
            }
            else {
                this.showBigMessage("Congratulations!!!");
            }
            
            this.showLittleMessage("Press 'r' to restart");
            
        }
    },
    
    /**
     * Displays a big message in the center of the canvas
     */
    showBigMessage: function(message) {
        
        game.context.fillStyle = "rgb(250, 250, 250)";
        game.context.font = "55px Helvetica";
        game.context.textAlign = "center";
        game.context.textBaseline = "top";
        game.context.fillText(message, game.canvas.width/2, game.canvas.height/2);
        
    },
    
    /**
     * Displays a submessage on the canvas
     */
    showLittleMessage: function(message) {
        
        game.context.fillStyle = "rgb(200, 200, 200)";
        game.context.font = "25px Helvetica";
        game.context.textAlign = "center";
        game.context.textBaseline = "top";
        game.context.fillText(message, game.canvas.width/2, game.canvas.height/2 + 65);
        
    },
    
    
    /**
     * Checks to see if the ball hits the paddle and carries out appropriate action
     */
    paddleCollision: function(modifier) {
        
        var paddleCollision = ball.collides(-paddle.width / 2 + paddle.offset, paddle.height / 2, paddle.width, paddle.height, modifier);
        
        if (paddleCollision.intersects) {
            
            // Move the ball to where it hits the paddle and update the modifier
            // so it can reflect smoothly
            ball.translate(modifier * paddleCollision.t);
            modifier -= modifier * paddleCollision.t;
            
            // If the ball hits in the top of the paddle
            if (paddleCollision.face == 3) {
                ball.direction.y = -ball.direction.y;
                // Makes the ball direction change slightly depending on where on the paddle it
                // hits; the left part of the paddle makes it go more left for example
                ball.direction.x += (ball.position.x - paddle.offset) * 0.01;
                ball.direction = support.normaliseVector(ball.direction);
            }
            else if (paddleCollision.face % 2 == 1) {
                ball.direction.x = -ball.direction.x;
                game.isOver = true;
            }
            else {
                game.isOver = true;
            }
        }
        return modifier;
    },
    
    /**
     * Checks to see if there is a brick collision and updates the score
     * and direction of the ball if there is.
     * 
     * If there is no collision, the ball is translated to where it
     * should be
     */
    brickCollision: function(modifier) {
        
        // Checks if the ball collides with any bricks
        var closest = null;
        var id = -1;
        for (brickId = 0; brickId < bricks.coordinates.length; brickId++) {
            var col = ball.collides(bricks.getXCoordinate(brickId), bricks.getYCoordinate(brickId), bricks.width, bricks.height, modifier);
            
            if (closest == null) {
                if (col.intersects) {
                    closest = col;
                    id = brickId;
                }
            }
            else if (col.intersects && col.t < closest.t) {
                closest = col;
                id = brickId;
            }
        }
        
        // The ball hita brick, so score and do the appropriate thing
        if (closest != null) {
            // When a brick is hit, increase the score, increase the
            // speed of the ball, and remove the brick
            game.score += 1;
            // Increasing the ball speed by 6% each time will result in the
            // ball being approx. 10x as fast when all the bricks are gone
            ball.velocity *= 1.06;
            bricks.coordinates.splice(id, 1);
            
            // Move the ball to where it hit the object and update the modifier
            // so it can reflect smoothly
            ball.translate(modifier * closest.t);
            modifier = modifier * closest.t;
            
            // Bounce the ball in the right direction
            if (closest.face % 2 == 1) {
                ball.direction.y = -ball.direction.y;
            }
            else {
                ball.direction.x = -ball.direction.x;
            }
            
            // Calls the update function with the new modifier in case another
            // collision happens within the time
            this.update(modifier);
        }
        // If no collisions happen, move the ball
        else {
            ball.translate(modifier);
        }
        
    },
    
    
    /**
     * Listens for keyboard input and moves the ball and performs
     * actions as required, updating various variables
     */
    update: function (modifier) {
        
        // If the game hasn't yet started, display a message
        if (!this.isStarted) {
            // Spacebar has been pressed
            if (32 in this.keysDown) {
                this.isStarted = true;
            }
            
            // d pressed to disable challenge mode
            if (68 in this.keysDown) {
                this.challengeMode = false;
            }
            // e pressed to enable challenge mode
            else if (69 in this.keysDown) {
                this.challengeMode = true;
            }
        }
        
        // Disable keyboard input when the game is paused. This prevents
        // cheating by pausing the game and moving the paddle.
        // Also let the player know how to unpause
        else if (this.isPaused) {
            // Listen only for the unpause command (u).
            if (85 in this.keysDown) {
                this.isPaused = false;
            }
        }
        // If the game is over, allow the player to restart
        else if (this.isOver) {
            if (82 in this.keysDown) {
                this.setup();
            }
        }
        else {
            // Left arrow key
            if (37 in this.keysDown) {
                // Move paddle left and ensures the paddle doesn't go off screen
                paddle.offset = Math.max(paddle.offset - paddle.velocity * modifier, -225);
            }
            // Right arrow key
            if (39 in this.keysDown) {
                // Move paddle right and ensures the paddle doesn't go off screen
                paddle.offset = Math.min(paddle.offset + paddle.velocity * modifier, 225);
            }
            // Pauses the game
            if (80 in this.keysDown) {
                this.isPaused = true;
            }
            
            modifier = this.paddleCollision(modifier);
            
            this.brickCollision(modifier);
            
        }
    },
    
    /**
     * Renders all of the game objects on the screen
     */
    render: function () {
        
        if (this.backgroundImage.isReady) {
            this.context.drawImage(this.backgroundImage, 0, 0);
        }
        
        if (paddle.image.isReady) {
            this.context.drawImage(paddle.image, game.coordinateOffsetX - paddle.width/2 + paddle.offset,
                    game.coordinateOffsetY - paddle.height/2);
        }
        
        if (bricks.image.isReady) {
            // Draws each brick in the correct position
            for (i = 0; i < bricks.coordinates.length; i++) {
                this.context.drawImage(bricks.image, game.coordinateOffsetX + bricks.getXCoordinate(i),
                        game.coordinateOffsetY - bricks.getYCoordinate(i));
            }
        }
        
        // Drawing the ball on the screen
        this.context.beginPath();
        this.context.arc(game.coordinateOffsetX + ball.position.x, game.coordinateOffsetY - ball.position.y, ball.radius, 0, Math.PI*2, true);
        this.context.closePath();
        this.context.fillStyle = ball.color;
        this.context.fill();
        
        // Displaying the score on screen
        this.context.fillStyle = "rgb(250, 250, 250)";
        this.context.font = "24px Helvetica";
        this.context.textAlign = "left";
        this.context.textBaseline = "top";
        this.context.fillText("Score: " + this.score, 32, 13);
        
        // Displays messages over the game
        this.messageOverlay();
        
    },
    
    
    /**
     * The main game loop which keeps everything going smoothly
     */
    play: function () {
        var currentTime = Date.now();
        var delta = currentTime - this.previousTime;
        
        // Updates the game model, with the time since the last update.
        // This is to keep the game smooth even if the framerate isn't
        // consistent
        game.update(delta / 1000);
        
        // Updates the game display
        game.render();

        this.previousTime = currentTime;

        // Request another iteration of the loop
        requestAnimationFrame(game.play);
        
    }
};


var paddle = {
    
    /**
     * Contains the image for the paddle
     */
    image: null,
    
    /**
     * The width of the paddle in pixels
     */
    width: 150,
    
    /**
     * The height of the paddle in pixels
     */
    height: 20,
    
    /**
     * The velocity of the paddle
     */
    velocity: 255,
    
    /**
     * How far the paddle is offset from it's starting position
     */
    offset: 0
};


var bricks = {
    
    /**
     * The width of the brick in pixels
     */
    width: 75,
    
    /**
     * The height of the brick in pixels
     */
     height: 30,
     
    /**
     * Image for the brick which is set when the game is set up
     */
    image: null,
    
    /**
     * An array containing the coordinate of each brick
     */
    coordinates: [],
    
    /**
     * Fills up the brick matrix at the start of a game into an 8 x 5 matrix
     */
    populateBricks: function() {
        // Empties the coordinate array
        this.coordinates = [];
        
        // Repopulates the coordinate array with an 8x5 matrix
        // ie, (0, 0), (1, 0), ..., (7, 0),
        //     (0, 1), (1, 1), ..., (7, 1),
        //     ...
        //     (0, 4), (1, 4), ..., (7, 4)
        for (i = 0; i < 8 * 5; i++) {
            this.coordinates.push({x: i % 8, y: Math.floor(i / 8)});
        }
    },
    
    /**
     * Returns the x-coordinate of the left-edge of the specified brick
     */
    getXCoordinate: function(index) {
        var x = this.coordinates[index].x;
        // Bricks are 75 pixels side and there is a 30 pixel space on the left
        return (-4 + x) * 75;
    },
    
    /**
     * Returns the y-coordinate of the top-edge of the specified brick
     */
    getYCoordinate: function(index) {
        var y = this.coordinates[index].y;
        // Bricks are 30 pixels tall and there is a 50 pixel space for the
        // score line, and 50 pixels above the bricks
        return 330 - y * 30;
    }
};


var ball = {
    
    /**
     * Spawns the ball and places it in a random position on the paddle with a
     * direction relative to that. The velocity is also reset
     */
    spawn: function() {
        // Random number between -65 and 65, inclusive, for choosing the initial
        // position and direction of the ball
        var randomBall = Math.floor(Math.random() * 131) - 65;

        // Value for normalising the direction
        var ballNormal = Math.sqrt(Math.pow(randomBall, 2) + Math.pow(65, 2));
        
        // Positions the ball on the paddle
        this.position.x = randomBall;
        this.position.y = paddle.height/2 + this.radius/2;
        
        // Sets the direction relative to the position
        this.direction.x = randomBall/ballNormal;
        this.direction.y = 65/ballNormal;
        
        this.velocity = 1;
    },
    
    /**
     * Position of the ball relative to the bottom middle of the canvas.
     * The origin (0, 0) is at the center of the paddle in it's resting position
     */
    position: {x: 0, y: paddle.height/2 - this.radius/2},
    
    /**
     * Radius of the ball in pixels
     */
    radius: 10,
    
    /**
     * The direction of the ball as a vector (x, y)
     */
    direction: {x: 0, y: 1},
    
    /**
     * Velocity of the ball (ie, how fast it moves)
     */
    velocity: 1,
    
    /**
     * The color of the ball
     */
    color: "#007",
    
    /**
     * Translates the ball to where it needs to be after the specified time.
     * This deals with collisions with the walls but not the bricks
     */
    translate: function(time) {
        
        var resultingPosition = {x: this.position.x + this.direction.x * this.velocity * time * 100,
                y: this.position.y + this.direction.y * this.velocity * time * 100};
        
        // Variable to store the proportion along the path that a collision happens
        var t = 1;
        var tempT;
        
        // 0: hits no walls, 1: hits left wall, 2: hits floor, 3: hits right wall, 4: his ceiling
        var hits = 0;
        
        var topLeft = {x: -290, y: 360};
        var bottomLeft = {x: -290, y: -10};
        var bottomRight = {x: 290, y: -10};
        var topRight = {x: 290, y: 360};
        
        // Intersects left wall
        if (support.doCross(this.position, resultingPosition, topLeft, bottomLeft) && this.position.x != topLeft.x) {
            t = support.intersection(this.position, resultingPosition, topLeft, bottomLeft);
            hits = 1;
        }
        // Right wall
        else if (support.doCross(this.position, resultingPosition, bottomRight, topRight) && this.position.x != bottomRight.x) {
            tempT = support.intersection(this.position, resultingPosition, bottomRight, topRight);
            if (tempT < t) {
                t = tempT;
                hits = 3;
            }
        }
        
        // Floor
        if (support.doCross(this.position, resultingPosition, bottomLeft, bottomRight) && this.position.y != bottomLeft.y) {
            tempT = support.intersection(this.position, resultingPosition, bottomLeft, bottomRight);
            if (tempT < t) {
                t = tempT;
                hits = 2;
            }
        }
        // Ceiling
        else if (support.doCross(this.position, resultingPosition, topRight, topLeft) && this.position.y != topRight.y) {
            tempT = support.intersection(this.position, resultingPosition, topRight, topLeft);
            if (tempT < t) {
                t = tempT;
                hits = 4;
            }
        }
        
        
        this.position.x += this.direction.x * this.velocity * time * t * 100;
        this.position.y += this.direction.y * this.velocity * time * t * 100;
        
        // If the ball hits the floor:
        if (hits == 2) {
            
            game.isOver = true;
            
        }
        else {
            if (hits == 4) {
                
                this.direction.y = - this.direction.y;
                
            }
            else if (hits == 1 || hits == 3 ) {
                
                if (game.challengeMode) {
                    
                    // Moves the ball to the other side of the window
                    this.position.x = (2 - hits) * 290;
                    
                }
                else {
                    
                    // Bounces the ball off of the wall
                    this.direction.x = -this.direction.x;
                }
                
            }
            
        }
    },
    
    /**
     * Checks to see if the ball will hit a rectangle, top left coord' at (x, y)
     * with width, height. Time is used to calculate how far the ball will travel,
     * and so is used to derive the line segment to check for the ball.
     * 
     * Returns {intersects, t, face} where:
     *     intersects - a boolean which calculates if the ball will collide
     *     t          - a value between 0 and 1. If this is 0.5, for example,
     *                  the ball will collide in half the specified time
     *     face       - the number of the face that the ball hits
     *                      0 - left edge
     *                      1 - bottom edge
     *                      2 - right edge
     *                      3 - top edge
     */
    collides: function(x, y, width, height, time) {
        
        // Original position of the ball
        var start = {x: this.position.x, y: this.position.y};
        
        // Where the ball would end up after specified time elapses
        var end = {x: this.position.x + this.direction.x * this.velocity * time * 100,
                   y: this.position.y + this.direction.y * this.velocity * time * 100};
        // List of the vertices of the rectangle to check for collision
        var vertices = [
            {x: x,         y: y},
            {x: x,         y: y - height},
            {x: x + width, y: y - height},
            {x: x + width, y: y}
        ];        
        
        // A value for storing the distance to the closest edge.
        // If 0 <= minT <= 1, a collision has happened
        var minT = 1;
        
        // Indicates the number of the face intersected.
        // All lines within the game are horizontal or vertical
        var hittingFace = -1;
        for (vertexId = 0; vertexId < vertices.length; vertexId++) {
            if (support.doCross(start, end, vertices[vertexId], vertices[(vertexId + 1) % vertices.length])) {
                t = support.intersection(start, end, vertices[vertexId], vertices[(vertexId + 1) % vertices.length]);
                if (t != null && t <= minT && t >= 0) {
                    minT = t;
                    hittingFace = vertexId;
                }
            }
        }
        
        // If a collision has happened
        if (hittingFace >= 0) {
            return {intersects: true, t: minT, face: hittingFace};
        }
        // else no collision with the object
        else {
            return {intersects: false, t: minT, face: hittingFace};
        }
        
    }
};


/**
 * Various useful functions which other methods can use
 */
var support = {
    
    /**
     * Returns:
     *     0 if point C is on the line A, B
     *     > 0 if point C is left of line A, B
     *     < 0 if point C is right of line A, B
     */
    L: function(A, B, C) {
        return (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
    },
    
    /**
     * Returns:
     *     true if line A, B crosses line C, D or if an end of one line segment
     *     lays somewhere along the other
     */
    doCross: function(A, B, C, D) {
        if (this.L(A, B, C) * this.L(A, B, D) <= 0.001 &&
                this.L(C, D, A) * this.L(C, D, B) <= 0.001) {

            // Ensures the bounding boxes of the lines coincide; only Y values
            // are considered, as this exists to catch a special case of the ball
            // travellening parallel with an edge, and the ball never moves horizontally
            if ((A.y < C.y && B.y < C.y && A.y < D.y && B.y < D.y) ||
                    (A.y > C.y && B.y > C.y && A.y > D.y && B.y > D.y)) {
                return false;
            }
            return true;
        }
        else {
            return false;
        }
    },
    
    /**
     * Returns a value between 0 and 1 for where along the segment A, B an
     * intersection happens with line C, D.
     * 
     * If lines are parallel, null is returned as parallel lines never intersect
     */
    intersection: function(A, B, C, D) {

        // Differences of x and y in the lines
        var L1x = B.x - A.x; var L1y = B.y - A.y;
        var L2x = D.x - C.x; var L2y = D.y - C.y;

        // Checks to see if the lines are parallel or start and end on a single point
        if (Math.abs(L1y/L1x - L2y/L2x) <= 0.0000000000001) {
            return null;
        }

        t = (L2x * (A.y - C.y) - L2y * (A.x - C.x)) / (L2y * L1x - L2x * L1y);
        return t;
    },
     
    /**
     * Returns true if point is inside convex shape made of of given vertices.
     * Vertices must be input in counter-clockwise direction
     */
    contains: function (point, vertices) {
        for (vert = 0; vert < vertices.length; vert++) {
            if (L(point, vertices[vert], vertices[(vert + 1) % vertices.length]) < 0) {
                return false;
            }
        }
        return true;
        
    },
    
    /**
     * Normalises the given vector (ie, makes the length of the vector 1)
     */
     normaliseVector: function(vector) {
         var xCoord = vector.x;
         var yCoord = vector.y;
         var length = Math.sqrt(Math.pow(xCoord, 2) + Math.pow(yCoord, 2));
         xCoord /= length;
         yCoord /= length;
         
         return {x: xCoord, y: yCoord};
     },
     
     /**
      * Loads and returns an image at a given url
      */
    loadImage: function(path) {
            
        var image = new Image();
        image.isReady = false;
        image.onload = function () {
            this.isReady = true;
        };
        image.src = path;
        
        return image;
    }
};


// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

game.setup();

game.play();
