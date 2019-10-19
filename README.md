# Happy Browser Game Making

## Making programs that are nice to people.

Making programs that are nice to people means making programs that don't create [lock-in](https://en.wikipedia.org/wiki/Vendor_lock-in). A great way to do this is to make [small programs that do one thing well](https://blog.izs.me/2013/04/unix-philosophy-and-nodejs). That way your friends can use these small programs to make larger programs in the same way you can build a castle from lego bricks. This will make your friends happy! not only because because building with bricks is fun, but also because people can substitute any bricks as they wish.

This list attempts to create:
- list of small bricks you can use to create browser games.
- wish list for bricks that might be useful.
- some example games.

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
- https://www.npmjs.com/package/game-shell
- https://www.npmjs.com/package/nanobus
- https://github.com/stackgl