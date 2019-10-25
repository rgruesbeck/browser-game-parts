const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
const cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

import { createOverlay } from 'arclib-overlay';
import { createSprite } from 'arclib-sprite';

import {
    loadList,
    loadImage,
    loadSound,
    loadFont
} from 'game-asset-loader';

import {
    hashCode
} from './utils.js'

import {
    pickFromList
} from './baseUtils.js'

import {
    gridRow,
    neighborDown,
    neighborLeft,
    neighborRight,
    setGridCell,
    getCellSize
} from './grid.js';

import audioContext from 'audio-context';
import audioPlayback from 'audio-play';

import Piece from './piece.js';
import ImageSprite from './imageSprite.js';

class Game {

    constructor(root, config) {
        this.root = root;
        this.config = config; // config
        this.prefix = hashCode(this.config.settings.name); // set prefix for local-storage keys

        console.log(this.config)

        // create game screen
        this.canvas = document.createElement('canvas');
        this.root.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d"); // game screen context

        this.audioCtx = audioContext();
        this.playlist = [];

        // create overlay
        this.overlay = createOverlay(this.root, ({ html, styleMap }) => {
            return ((data) => {
                let styles = {
                    color: 'red'
                }

                return html`
                    <div style=${styleMap(styles)}>
                        <p>Frames: ${data.frames}</p>
                    </div>
                `;
            })
        });

        // setup event listeners
        // handle keyboard events
        document.addEventListener('keydown', ({ code }) => this.handleKeyboardInput('keydown', code));
        document.addEventListener('keyup', ({ code }) => this.handleKeyboardInput('keyup', code));


        // setup event listeners for mouse movement
        document.addEventListener('touchmove', ({ touches }) => this.handleTouchMove(touches[0]));


        // handle swipes
        document.addEventListener('touchstart', ({ touches }) => this.handleSwipe('touchstart', touches[0]));
        document.addEventListener('touchmove', ({ touches }) => this.handleSwipe('touchmove', touches[0]));
        document.addEventListener('touchend', ({ touches }) => this.handleSwipe('touchend', touches[0]));

    }

    init() {
        // frame count, rate, and time
        // this is just a place to keep track of frame rate (not set it)
        this.frame = {
            count: 0,
            time: Date.now(),
            rate: null,
            scale: null
        };

        // set canvas
        this.canvas.height = this.root.clientHeight; // set game screen height
        this.canvas.width = this.root.clientWidth; // set game screen width

        // set screen
        this.screen = {
            top: 0,
            bottom: this.canvas.height,
            left: 0,
            right: this.canvas.width,
            centerX: this.canvas.width / 2,
            centerY: this.canvas.height / 2,
            width: this.canvas.width,
            height: this.canvas.height,
            scale: ((this.canvas.width + this.canvas.height) / 2) * 0.003
        };


        // game settings
        this.state = {
            current: 'loading',
            prev: '',
            tickRate: parseInt(this.config.settings.tickRate),
            score: 0,
            paused: false,
            muted: localStorage.getItem(this.prefix.concat('muted')) === 'true'
        };


        this.input = {
            active: 'keyboard',
            keyboard: { up: false, right: false, left: false, down: false },
            mouse: { x: 0, y: 0, click: false },
            swipe: { },
            touch: { x: 0, y: 0 },
        };

        let columns = parseInt(this.config.settings.columns);
        let rows = parseInt(this.config.settings.rows);

        this.board = {
            grid: [],
            blocks: [],
            columns: columns,
            rows: rows,
            height: rows,
            width: columns,
            cellSize: getCellSize(this.screen.width, this.screen.height, rows, columns),
            lastClear: 0
        }

        // tick queue and random bag
        this.tickQueue = [];
        this.bag = [];

        // create lists
        this.pieces = []; // place to put active pieces
        this.stack = []; // place to put stacked blocks
        this.cleared = []; // place to host cleared blocks

        this.images = {}; // place to keep images
        this.sounds = {}; // place to keep sounds
        this.fonts = {}; // place to keep fonts


        // set document body to backgroundColor
        this.root.style.backgroundColor = this.config.colors.backgroundColor;
    }

    load() {
        // load pictures, sounds, and fonts
    
        if (this.sounds && this.sounds.backgroundMusic) { this.sounds.backgroundMusic.pause(); } // stop background music when re-loading

        this.init(); // apply new configs
        
        // load game assets
        const gameAssets = [
            loadImage('block1', this.config.images.block1),
            loadImage('block2', this.config.images.block2),
            loadImage('block3', this.config.images.block3),
            loadImage('block4', this.config.images.block4),
            loadImage('block5', this.config.images.block5),
            loadImage('block6', this.config.images.block6),
            loadImage('spectatorLeft', this.config.images.spectatorLeft),
            loadImage('spectatorRight', this.config.images.spectatorRight),
            loadSound('clearSound', this.config.sounds.clearSound),
            loadSound('dropSound', this.config.sounds.dropSound),
            loadSound('backgroundMusic', this.config.sounds.backgroundMusic),
            loadFont('gameFont', this.config.settings.fontFamily)
        ];

        // put the loaded assets the respective containers
        loadList(gameAssets, (progress) => {
            console.log(`loading: ${progress.percent}%`);
        })
        .then((assets) => {

            this.images = assets.image;
            this.sounds = assets.sound;

        })
        .then(() => this.create())
        .catch(err => console.error(err));
    }

    create() {
        let sprite = createSprite({}, ({ renderCtx }) => {
            console.log('render')
        })
        console.log(sprite);

        // setup block styles
        this.blockStyles = [
            {
                color: this.config.colors.block1,
                image: this.images.block1
            },
            {
                color: this.config.colors.block2,
                image: this.images.block2
            },
            {
                color: this.config.colors.block3,
                image: this.images.block3
            },
            {
                color: this.config.colors.block4,
                image: this.images.block4
            },
            {
                color: this.config.colors.block5,
                image: this.images.block5
            },
            {
                color: this.config.colors.block6,
                image: this.images.block6
            }
        ];

        this.setState({ current: 'ready' });
        this.play();
    }

    play() {
        // update game characters
        // dev
        this.overlay.update({
            frames: this.frame.count
        })

        // clear the screen of the last picture
        this.ctx.fillStyle = this.config.colors.backgroundColor; 
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = this.config.colors.boardColor; 
        this.ctx.fillRect(0, 0, this.board.width * this.board.cellSize, this.board.height * this.board.cellSize);

        // draw and do stuff that you need to do
        // no matter the game state
        // this.ctx.drawImage(this.images.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);

        // ready to play
        if (this.state.current === 'ready') {

          if (this.state.prev === 'loading') {

            this.setState({ current: 'ready' });
          }

        }

        // game play
        if (this.state.current === 'play') {
             // if last state was 'ready'

            if (this.state.prev === 'ready') {
            }

            // background music
            if (!this.state.muted && !this.state.backgroundMusic) {
                this.state.backgroundMusic = true;
                this.playback('backgroundMusic', this.sounds.backgroundMusic, {
                    start: 0,
                    end: this.sounds.backgroundMusic.duration,
                    loop: true,
                    context: this.audioCtx
                });
            }

            // check for game over
            // game over if there are blocks on the top row
            let topRow = gridRow(this.board.grid, 0);
            if (topRow.length > 0) {
                this.setState({ current: 'over' });
            }

            // get new random bag of pieces
            // if bag is empty
            if (this.bag.length < 1) {
                this.bag = [0, 1, 2, 3, 4, 5, 6];
            }

            // every game tick update the game
            let queuedTick = this.tickQueue.length > 0;
            if (queuedTick) {

                // run tick task: shift, rotate, etc
                this.tickQueue.sort((a, b) => a.priority - b.priority);
                const tick = this.tickQueue.pop();
                tick.run();

                // if there is a placed piece
                // transfer all the blocks from a placed piece
                // to the stack of blocks
                this.stack = [
                    ...this.stack,
                    ...this.placedBlocks()
                ];

                // remove placed pieces from pieces list
                this.pieces = [
                    ...this.pieces
                    .filter(piece => !piece.placed)
                ]

                // if there is no piece in play
                // put a new piece in play
                if (this.pieces.filter(p => !p.placed).length < 1) {
                    // pick a random style
                    // and pick a random shape from the bag
                    let block = pickFromList(this.blockStyles);
                    let shape = pickFromList(this.bag);

                    this.pieces = [
                        ...this.pieces,
                        new Piece({
                            ctx: this.ctx,
                            board: this.board,
                            image: block.image,
                            color: block.color,
                            shape: shape,
                            cellSize: this.board.cellSize,
                            cellBounds: {
                                top: 0,
                                right: this.board.width,
                                bottom: this.board.height,
                                left: 0
                            },
                            bounds: this.screen
                        })
                    ]

                    // remove shape from the bag
                    this.bag = [
                        ...this.bag
                        .filter(s => s != shape)
                    ]
                }


                // update board blocks
                this.board.blocks = [
                    ...this.pieces
                    .map(piece => piece.body)
                    .reduce((blocks, body) => {
                        // for Safari 11 support
                        // used in place of Array.flat()

                        return [...blocks, ...body];
                    }, []),
                    ...this.stack
                ]

                // update the grid with
                // current placed block locations
                this.board.grid = this.stack
                .map(blocks => blocks.cell)
                .reduce((grid, cell) => {

                   // flag the grid cell as occupied by a block
                   return setGridCell(grid, cell, true);

                }, [])

            }

            // schedule a tick to shift piece down by tick rate
            let scheduledTick = this.frame.count % this.state.tickRate === 0;
            if (scheduledTick) {
                
                // queue shift down for block in the piece
                this.queueTick(1, () => this.shiftPieceDown());

                // clear-line
                // full rows of block get removed
                // get row counts (how many placed blocks are in each row)
                let rowCounts = this.stack
                .map(block => block.cell.y)
                .reduce((rows, y) => {

                    // set empty cell to 0
                    if (typeof rows[y] === 'undefined') { rows[y] = 0; }

                    // increment cell full count
                    rows[y] += 1;

                    return rows;
                }, {})

                // get full rows (row count equals board columns)
                let fullRows = Object.entries(rowCounts)
                .filter(ent => ent[1] === this.board.columns)
                .map(ent => parseInt(ent[0]));

                // remove blocks from full row
                // and shift the stack down
                if (fullRows.length > 0) {
                    // set cleared stamp
                    this.board.lastClear = Date.now();

                    // award points
                    this.setState({ score: this.state.score + 100 });

                    // images from cleared line to cleared
                    // as image sprites
                    this.cleared = [
                        ...this.cleared,
                        ...this.stack
                        .filter(block => block.cell.y === fullRows[0])
                        .map(block => {
                            return new ImageSprite({
                                ctx: this.ctx,
                                image: block.image,
                                x: block.x,
                                y: block.y,
                                width: block.width,
                                height: block.height,
                                speed: 5,
                                bounds: null
                            })
                        })
                    ];

                    // clear-line gravity
                    // do cascade style clear-line gravity
                    // https://tetris.fandom.com/wiki/Line_clear#Line_clear_gravity

                    // mark all block above line as unsupported
                    // remove blocks
                    this.stack = [
                        ...this.stack
                        .map(block => {
                            if (block.cell.y < fullRows[0]) {
                                block.unsupported = true;
                            }

                            return block;
                        })
                        .filter(block => {
                            // remove full row blocks
                            return block.cell.y != fullRows[0];
                        })
                    ]

                    this.playback('clearSound', this.sounds.clearSound);

                    // queue shift down for blocks in the stack
                    this.queueTick(1, () => this.shiftStackDown());
                }


            }

            // draw board
            this.board.blocks
            .forEach(block => block.draw());

            // update cleared
            this.cleared = [
                ...this.cleared
                .map((sprite, idx) => {
                    let dx = idx % 2 === 0 ? 0.5 : -0.5;
                    let dy = idx % 3 === 0 ? -1 : -1.5;

                    sprite.move(dx, dy, this.frame.scale);

                    return sprite;
                })
                .filter(sprite => sprite.y > 0)
                .filter(sprite => sprite.x > 0 + sprite.width)
                .filter(sprite => sprite.x < this.screen.right)
            ]

            // draw cleared
            this.cleared
            .forEach(sprite => sprite.draw());
        }

        // player wins
        if (this.state.current === 'win') {
            // win code
        }

        // game over
        if (this.state.current === 'over') {
            // game over code
        }

        // draw the next screen
        this.requestFrame(() => this.play());
    }


    shiftStackDown() {
        // shift un-supported blocks down
        this.stack = this.stack
        .map(block => {

            if (block.unsupported) {

                // shift down
                block.shift({ y: 1 });

                // re-mark as supported
                block.unsupported = false;
            }

            return block;
        })
    }

    shiftPieceDown() {
        this.updatePieces((piece) => {
            // check for bottom
            let hitBottom = piece.box.bottom > this.board.height - 2;

            // check for blocks below
            let hasDownNeighbor = piece.body
                .some(block => {
                    return neighborDown(this.board.grid, block.cell);
                })


            if (!hitBottom && !hasDownNeighbor) {

                // shift down
                piece.shift({ y: 1 });
            } else {
                piece.placed = true;
                
                // if an inifinity mode enabled piece moved or rotated action, reset preplaceTick
                /*
                if(this.state.infinityAction) {
                    piece.preplaceTick = 0;
                    this.setState({ infinityAction: false });
                }

                if (piece.preplaceTick >= this.state.lockDelayTicks) {

                    // mark as placed
                    piece.placed = true;
                } else {
                    
                    // increment preplaceTick
                    piece.preplaceTick += 1;

                }
                */
            }

            return piece;
        });
    }

    shiftPieceLeft() {
        this.updatePieces((piece) => {
            // check for left blocks
            let hasLeftNeighbor = piece.body
            .some(block => {
                // check there is a block on the left
                return neighborLeft(this.board.grid, block.cell);
            });

            if (!hasLeftNeighbor) {

                // shift to the left
                piece.shift({ x: -1 })
            }

            return piece;
        });
    }

    shiftPieceRight() {
        this.updatePieces((piece) => {
            // check for right blocks
            let hasRightNeighbor = piece.body
            .some(block => {
                // check there is a block on the left
                return neighborRight(this.board.grid, block.cell);
            });

            if (!hasRightNeighbor) {

                // shift to the right
                piece.shift({ x: 1 })
            }

            return piece;
        });
    }

    rotatePiece() {
        this.updatePieces((piece) => {
            // check if the rotation results would
            // take up occupied spaces
            let rotatedCells = piece.rotatedCells()
            .map(cell => {
                // add string id
                cell.id = `${cell.x}-${cell.y}`;

                return cell;
            })

            // .map(cell => `${cell.x}-${cell.y}`)

            let blockingCells = this.stack
            .map(block => block.cell)
            .some(cell => {
                // check if cells are blocking
                let id = `${cell.x}-${cell.y}`;

                return rotatedCells
                .map(cell => cell.id)
                .includes(`${cell.x}-${cell.y}`);
            });

            // or be off screen
            let onEdge = rotatedCells
            .some(cell => {
                let { x, y } = cell;
                let offX = x < 0 || x >= this.board.columns;
                let offY = y < 0 || y >= this.board.rows;

                return offX || offY;
            });

            if (!blockingCells && !onEdge) {

                piece.rotate();
            }

            return piece;
        });
    }

    dropPiece() {
        // drop down until hitting the stack
        // get the the piece
        let maxShift = this.board.rows;

        let piece = this.pieces
        .filter(piece => !piece.placed)
        .reduce(piece => piece);

        // get the top block of the stack and, calculate the remaining rows
        let stackCells = this.stack
        .map(block => block.cell);

        let minShift = piece.body
        .map(block => block.cell)
        .reduce((min, cell) => {
            // find the pairs of cells (piece, stack) on x axis that has the
            // minimum number of rows in between

            let stackPairs = stackCells.filter(sc => sc.x === cell.x);
            let minPair = stackPairs.reduce((minP, sp) => {
                return minP.y < sp.y ? minP : sp;
            }, { y: maxShift });

            let dy = minPair.y - cell.y;

            return min < dy ? min : dy;
        }, maxShift);

        // queue downshifts for number of remaining rows
        for (let row = 0; row < minShift; row += 1) {
            this.queueTick(0, () => this.shiftPieceDown());
        }

        this.playback('dropSound', this.sounds.dropSound);
    }

    updatePieces(fn) {
        this.pieces = this.pieces
        .map(p => fn(p));
    }

    queueTick(priority, fn) {

        // add a new tick to the tick queue
        this.tickQueue = [
            { priority: priority, run: fn },
            ...this.tickQueue
        ].sort((a, b) => a.priority - b.priority)
    }

    // event listeners
    handleClicks(target) {
        if (this.state.current === 'loading') { return; }
        // mute
        if (target.id === 'mute') {
            this.mute();
        }

        // pause
        if (target.id === 'pause') {
            this.pause();
        }

        // button
        if ( target.id === 'button') {
            this.setState({ current: 'play' });
        }

        if (this.state.current === 'over') {
            // restart
            this.setState({ current: 'loading' });
            this.reset();
        }

    }

    handleKeyboardInput(type, code, event) {
        this.input.active = 'keyboard';

        if (type === 'keydown' && this.state.current === 'play') {
            // If infinity mode is enabled:
            // Set flag that a key was pressed
            if (this.state.modeInfinity) { 
                    this.setState({infinityAction: true})
            }

            // rotate
            if (code === 'ArrowUp') {
                this.queueTick(0, () => this.rotatePiece());
            }

            // shift left
            if (code === 'ArrowLeft') {
                this.queueTick(0, () => this.shiftPieceLeft());
            }

            // shift right
            if (code === 'ArrowRight') {
                this.queueTick(0, () => this.shiftPieceRight());                
            }

            // shift down
            if (code === 'ArrowDown') {
                this.queueTick(0, () => this.shiftPieceDown());
            }

            // drop
            if (code === 'Space') {
                this.dropPiece();
            }
        }

        if (type === 'keydown') {

            // any key
            // reload when game over
            if (this.state.current.match(/over/)) {
                this.setState({ current: 'loading' });
                this.load();
            }

            // restart when game ready
            if (this.state.current.match(/ready/)) {
                this.setState({ current: 'play' });
                console.log('play!')
            }
        }
    }

    handleTap() {
        // rotate
        let now = Date.now();
        let time = now - this.lastTap;

        if ((time < 300) && (time > 0)) {
            // If infinity mode is enabled:
            // Set flag that a key was pressed
            if (this.state.modeInfinity) { 
                    this.setState({infinityAction: true})
            }
            
            // rotate on double tap   
            this.queueTick(0, () => this.rotatePiece());
        }

        this.lastTap = Date.now();
    }

    // convert swipe to a direction
    handleSwipeInput(type, touch) {
        // If infinity mode is enabled:
        // Set flag that a tap was double pressed
        if (this.state.modeInfinity) { 
            this.setState({infinityAction: true})
        }


        // clear touch list
        if (type === 'touchstart') {
            this.input.touches = [];
        }

        // add to touch list
        if (type === 'touchmove') {
            let { clientX, clientY } = touch;
            this.input.touches.push({ x: clientX, y: clientY });
        }

        // get user intention
        if (type === 'touchend') {
            let { touches } = this.input;
            let result = {};

            if (touches.length) {

                // get direction from touches
                result = this.input.touches
                .map((touch, idx, arr) => {
                    // collect diffs
                    let prev = arr[idx - 1] || arr[0];
                    return {
                        x: touch.x,
                        y: touch.y,
                        dx: touch.x - prev.x,
                        dy: touch.y - prev.y
                    }
                })
                .reduce((direction, diff) => {
                    // sum the diffs
                    direction.dx += diff.dx;
                    direction.dy += diff.dy;

                    return direction;
                });

                // get direction
                let swipesX = Math.abs(result.dx) > Math.abs(result.dy);
                let swipesY = Math.abs(result.dy) > Math.abs(result.dx);

                if (swipesX) {
                    if (result.dx > 0) {
                        // swipe right: shift right
                        this.queueTick(0, () => this.shiftPieceRight());
                    } else {
                        // swipe left: shift left
                        this.queueTick(0, () => this.shiftPieceLeft());
                    }
                }

                if (swipesY) {
                    if (result.dy > 0) {
                        // swipe down: drop
                        this.dropPiece();
                    } else {
                        // swipe up: rotate
                        // this.queueTick(0, () => this.rotatePiece());
                    }
                }
            }
        }
    }

    placedBlocks() {
        return this.pieces
        .filter(piece => piece.placed)
        .map(piece => piece.body)
        .reduce((blocks, body) => {
            // for Safari 11 support
            // used in place of Array.flat()

            return [...blocks, ...body];
        }, [])
    }

    // pause game
    pause() {
        if (this.state.current != 'play') { return; }

        this.state.paused = !this.state.paused;

        if (this.state.paused) {
            // pause game loop
            this.cancelFrame(this.frame.count - 1);

            // mute all game sounds
            this.audioCtx.suspend();

        } else {
            // resume game loop
            this.requestFrame(() => this.play(), true);

            // resume game sounds if game not muted
            if (!this.state.muted) {
                this.audioCtx.resume();
            }

        }
    }

    // mute game
    mute() {
        let key = this.prefix.concat('muted');
        localStorage.setItem(
            key,
            localStorage.getItem(key) === 'true' ? 'false' : 'true'
        );
        this.state.muted = localStorage.getItem(key) === 'true';


        if (this.state.muted) {
            // mute all game sounds
            this.audioCtx.suspend();
        } else {
            // unmute all game sounds
            if (!this.state.paused) {
                this.audioCtx.resume();
            }
        }
    }

    playback(key, audioBuffer, options = {}) {
        // ignore playback requests while paused
        if (this.state.muted) { return; }
        
        // add to playlist
        let id = Math.random().toString(16).slice(2);
        this.playlist.push({
            id: id,
            key: key,
            playback: audioPlayback(audioBuffer, {
                ...{
                    start: 0,
                    end: audioBuffer.duration,
                    context: this.audioCtx
                },
                ...options
            }, () => {
                // remove played sound from playlist
                this.playlist = this.playlist
                    .filter(s => s.id != id);
            })
        });
    }

    stopPlayback(key) {
        this.playlist = this.playlist
        .filter(s => {
            let targetBuffer = s.key === key;
            if (targetBuffer) {
                s.playback.pause();
            }
            return targetBuffer;
        })
    }

    // stop playlist
    stopPlaylist() {
      this.playlist
      .forEach(s => this.stopPlayback(s.key))
    }

    // update game state
    setState(state) {
        this.state = {
            ...this.state,
            ...{
                prev: this.state.current
            },
            ...state,
        };
    }

    // request new frame
    // wraps requestAnimationFrame.
    requestFrame(next, resumed) {
        let now = Date.now();
        this.frame = {
            count: requestAnimationFrame(next),
            time: now,
            rate: resumed ? 0 : now - this.frame.time,
            scale: this.screen.scale * this.frame.rate * 0.01
        };
    }

    // cancel frame
    // wraps cancelAnimationFrame.
    cancelFrame() {
        cancelAnimationFrame(this.frame.count);
    }
}

export default Game;