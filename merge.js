class Board {
    constructor(el) {
        this.el = document.querySelector(el);
        this.blocks = new Array(100).fill(null);

        this.init();
    }

    init() {
        this.blocks.forEach((_, idx) => {
            this.blocks[idx] = new Block(idx);
        });

        this.el.innerHTML = '';
        this.blocks.forEach(block => {
            this.el.appendChild(block.el);
        });

        this.customLevelSetting();
    }

    render() {
        this.blocks.forEach(block => {
            block.render();
        });
    }

    createRandomBlock() {
        const emptyBlocks = this.blocks.filter(block => block.data.level === null);
        const randomBlock = emptyBlocks[Math.floor(Math.random() * emptyBlocks.length)];
        randomBlock.data.level = 2;
        randomBlock.render();
    }

    customLevelSetting() {
        this.blocks[0].setLevel(1);
        this.blocks[4].setLevel(1);
        this.blocks[5].setLevel(1);
        this.blocks[15].setLevel(1);
        this.blocks[16].setLevel(1);
        this.blocks[18].setLevel(1);
        this.blocks[21].setLevel(1);
        this.blocks[26].setLevel(1);
        this.blocks[30].setLevel(1);
        this.blocks[55].setLevel(1);
        this.blocks[78].setLevel(1);
        this.blocks[99].setLevel(1);
        this.blocks[17].setLevel(1);
        this.blocks[19].setLevel(1);
        this.blocks[77].setLevel(1);
        this.blocks[87].setLevel(1);
        this.blocks[78].setLevel(1);
        this.blocks[91].setLevel(1);
        this.render();
    }
}

class Block {
    constructor(id) {
        this.id = id;
        this.el = null;
        this.clicked = false;
        this.data = {
            type: 0,
            level: null
        }
        this.create();
    }

    create() {
        const div = document.createElement('div');
        div.classList.add('block');
        div.id = this.id;
        div.style.color = "#fff";
        div.draggable = true;
        this.el = div;

        div.addEventListener('dragenter', e => {
            document.querySelectorAll('.drag-on').forEach(el => {
                el.classList.remove('drag-on');
            });
            div.classList.add('drag-on');
        })

        div.addEventListener('dragend', e => {
            if(!document.querySelector('.drag-on')) return;

            const fromEl = this.el;
            const toEl = document.querySelector('.drag-on');

            const temp = fromEl.innerHTML;

            if(toEl.innerHTML !== ""){
                if(toEl.innerHTML === fromEl.innerHTML){
                    fromEl.innerHTML = '';
                    toEl.innerHTML = +toEl.innerHTML + +temp;
                }else{
                    fromEl.innerHTML = toEl.innerHTML;
                    toEl.innerHTML = temp;    
                }
            }else{
                fromEl.innerHTML = toEl.innerHTML;
                toEl.innerHTML = temp;
            }

            toEl.classList.remove('drag-on');
        })

        div.addEventListener('touchstart', e => {
            console.log(div.id, 'touchstart')
        })
        div.addEventListener('touchmove', e => {
            console.log(div.id, 'touchmove')
        })
        div.addEventListener('touchend', e => {
            console.log(div.id, 'touchend')
        })
        div.addEventListener('touchcancel', e => {
            console.log(div.id, 'touchcancel')
        })
    }

    setLevel(level) {
        this.data.level = level;
    }

    render() {
        this.el.innerHTML = this.data.level;
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
}