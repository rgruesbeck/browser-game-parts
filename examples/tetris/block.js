import ImageSprite from './imageSprite.js';

class Block extends ImageSprite {
    constructor(options) {
        super({
            ...options,
            ...{
                width: options.size,
                height: options.size
            }
        });

        this.color = options.color;


        this.cell = options.cell;
        this.size = options.size;

        this.x = this.cell.x * this.size;
        this.y = this.cell.y * this.size;
    }

    draw() {
        // draw background color
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        // draw image
        super.draw();
    }

    shift({ x = 0, y = 0 }) {
        // update cell
        this.cell = {
            x: this.cell.x + x,
            y: this.cell.y + y
        };

        // update x and y
        this.x = this.cell.x * this.size;
        this.y = this.cell.y * this.size;
   }

}

export default Block;