import Game from './main.js';

const root = document.getElementById('root');
const config = {
    settings: {
        name: 'tetris',
        tickRate: 30,
        rows: 20,
        columns: 10
    },
    colors: {
        backgroundColor: "#000",
        boardColor: "#63D471",
        block1: "#96c8ef",
        block2: "#e76b93",
        block3: "#ffde55",
        block4: "#70efef",
        block5: "#ffcf30",
        block6: "pink"
    },
    images: {
        "block1": "https://i.imgur.com/lUPWv0E.png",
        "block2": "https://i.imgur.com/D6of24y.png",
        "block3": "https://i.imgur.com/LmfnfFQ.png",
        "block4": "https://i.imgur.com/StPlrV0.png",
        "block5": "https://i.imgur.com/X7nmGWr.png",
        "block6": "https://i.imgur.com/v03iKA8.png"
    },
    sounds: {
        backgroundMusic: "https://objects.koji-cdn.com/eedc4ffb-7d04-464e-8c92-f5291d76f048/TetrisSalsa.mp3",
        clearSound: "https://objects.koji-cdn.com/eedc4ffb-7d04-464e-8c92-f5291d76f048/sparkle.mp3",
        dropSound: "https://objects.koji-cdn.com/eedc4ffb-7d04-464e-8c92-f5291d76f048/whoosh3.mp3"
    }
};


const game = new Game(root, config);

game.load();