# Happy Hacking on Browser Games

## Making programs that are nice to people. (lego style)

Making programs that are nice to people means making programs that don't create [lock-in](https://en.wikipedia.org/wiki/Vendor_lock-in). A great way to make [small simple programs](https://blog.izs.me/2013/04/unix-philosophy-and-nodejs) that you can use like lego bricks so that people can throw away or substitute bricks as they wish.

This repo attempts to create a list of small bricks you can use to create browser games, a wish list for bricks that might be useful, and some example games.

## Components that games need.

### Game loop
Games need a way to request and draw a frame to the screen.

### Overlay
Browser games need a way to display buttons, menus, instructions, inventory, etc.

### Sprites
A flexible base for game objects.

https://www.npmjs.com/package/arclib-sprite

### Rendering context
A context for rendering graphics.

### Render methods
Methods for rendering game objects.

### Asset loaders
Methods for loading assets

https://www.npmjs.com/package/game-asset-loader

## run the examples
```sh
npm install
npm run tetris
```

## things to hack on!
- find small modules to add to the list
- create grid package
- game audio package
    - nice to have global play and pause
- partition2d
    - remove all collision detection
- package up utils

## modules list
https://www.npmjs.com/package/game-shell
https://www.npmjs.com/package/nanobus
https://github.com/stackgl