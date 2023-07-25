class Board {
    constructor(el) {
        this.el = document.querySelector(el);
        this.blocks = new Array(100).fill(null);

        this.init();
    }

    init() {
        this.blocks.forEach((_, idx) => {
            this.blocks[idx] = new Block();
        });

        this.render();
    }

    render() {
        this.el.innerHTML = '';
        this.blocks.forEach(block => {
            this.el.appendChild(block.el);
        });
    }
}

class Block {
    constructor() {
        this.el = null;
        this.clicked = false;
        this.create();
    }

    create() {
        const div = document.createElement('div');
        div.classList.add('block');

        div.addEventListener('mousedown', this.mouseDown.bind(this));
        document.addEventListener('mouseup', this.mouseUp.bind(this));

        this.el = div;
    }

    createClone() {
        const clone = this.el.cloneNode(true);
        clone.classList.add('clone');
        clone.style.cssText = `
            width: ${this.el.offsetWidth}px;
            height: ${this.el.offsetHeight}px;
            left: ${this.el.offsetLeft}px;
            top: ${this.el.offsetTop}px;
        `;

        this.clone = clone;

        document.addEventListener('mousemove', (e) => {
            clone.style.left = `${e.clientX}px`;
            clone.style.top = `${e.clientY}px`;
        });

        return clone;
    }

    mouseDown() {
        this.clicked = true;
        document.body.appendChild(this.createClone());
        this.el.classList.add('active');
    }

    mouseUp() {
        if(this.clicked) return;
        this.clicked = false;
        this.clone.remove();
        this.el.classList.remove('active');
    }
}