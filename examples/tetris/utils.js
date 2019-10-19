// get random number between min and max
const randomBetween = (min, max, type) => {
    const rand = Math.random() * (max - min) + min;

    if (type && type === 'int') {
        return Math.round(rand);
    }

    return rand;
}

// apply a lower and upper bound to a number
const bounded = (n, min, max) => {
    return [n]
    .map(n => n < min ? min : n)
    .map(n => n > max ? max : n)
    .reduce(n => n);
}

// check if n is within bounds
const isBounded = (n, min, max) => {
    return n > min && n < max;
}

// color converter
const hexToRgbA = (hex, opacity) => {
    let h=hex.replace('#', '');
    h =  h.match(new RegExp('(.{'+h.length/3+'})', 'g'));

    for(let i=0; i<h.length; i++)
        h[i] = parseInt(h[i].length==1? h[i]+h[i]:h[i], 16);

    if (typeof opacity != 'undefined')  h.push(opacity);

    return 'rgba('+h.join(',')+')';
}

// create throttled function
// checkout: https://outline.com/nBajAS
const throttled = (delay, fn) => {
    let lastCall = 0;
    return function (...args) {
        const now = (new Date).getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return fn(...args);
    }
}

// find an entity in the list
// useful for checking for collisions
const findInList = (entList, fn) => {
    return entList
        .find((ent) => {
            return fn(ent);
        }) ?
        true : false;
}

// find an entity in an object
// useful for checking for collisions
const findInObject = (entObject, fn) => {
    return Object.entries(entObject)
        .find((ent) => {
            return fn(ent);
        }) ?
        true : false;
}

// find an entity in an object or list
// wrapper for findInList and findInObject
const findIn = (entities, fn) => {

    // check against list
    if (Array.isArray(entities)) {
        return findInList(entities, fn);
    }

    // check against object
    if (Object.keys(entities) > 1) {
        return findInObject(entities, fn);
    }

    return false;
};

// toy hash for prefixes
// useful for prefexing localstorage keys
const hashCode = (str, base = 16) => {
    return [str.split("")
    .reduce(function(a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a
    }, 0)] // create simple hash from string
    .map(num => Math.abs(num)) // only positive numbers
    .map(num => num.toString(base)) // convert to base
    .reduce(h => h); // fold
};

// resize image by width
const resizeByWidth = (width, naturalWidth, naturalHeight) => {
    // cross multiply to get new height
    return {
        width: parseInt(width),
        height: parseInt(width * naturalHeight / naturalWidth)
    };
};

// resize image by height
const resizeByHeight = (height, naturalWidth, naturalHeight) => {
    // cross multiply to get new width
    return {
        height: parseInt(height),
        width: parseInt(height * naturalWidth / naturalHeight)
    };
};

// resize wrapper
const resize = ({ image, width, height }) => {
    // image required
    if (!image) {
        console.error('resize requires an image');
        return;
    }

    // width or height required
    if (!width && !height) {
        console.error('resize requires a width or height');
        return;
    }

    // useless echo
    if (width && height) {
        return { width: width, height: height };
    }

    // set variables
    let naturalWidth = image.width;
    let naturalHeight = image.height;
    let result = {};

    // if width: resize by width
    if (width) {
        result = {
            ...result,
            ...resizeByWidth(width, naturalWidth, naturalHeight)
        }
    }

    // if height: resize by height
    if (height) {
        result = {
            ...result,
            ...resizeByHeight(height, naturalWidth, naturalHeight)
        }
    }

    return result;
};

export {
    resize,
    bounded,
    isBounded,
    findIn,
    hexToRgbA,
    randomBetween,
    hashCode,
    throttled
};