export class BoardItem {
    constructor(id, board) {
        this.board = board;
        this.id = id;
        this.el = null;
        this.clicked = false;
        this.data = {
            type: 0,
            level: null,
            price: 0,
            fame: 0,
        }

        if(id === null) return;
        this.create();
    }

    create() {
        const div = document.createElement('div');
        div.classList.add('block');
        div.id = this.id;
        div.style.color = "#fff";
        div.draggable = true;

        this.el = div;
    }

    setLevel(level){
        if(level === null) {
            this.data.level = null;
            this.data.price = 0;
            this.data.fame = 0;
            this.render();
        }

        this.data.level = level;
        this.data.price = Math.trunc(2**(level - 1) * 20 * (1 + +this.board.fameLevel / 50));
        this.data.fame = Math.trunc(this.data.price / 5);
        return this.data;
    }

    render() {
        if(this.data.level === null){
            this.el.innerHTML = "";
            return;
        }
        
        // this.el.innerHTML = `<span class='dev'>${this.data.level}<br>${this.data.price}<br>${this.data.fame}</span>`;
        this.el.innerHTML = this.board.emogeArr[this.data.level - 1];
    }

    createClone() {
        const clone = this.el.cloneNode(true);
        clone.classList.add('clone');
        clone.style.cssText = `
            left: ${this.el.offsetLeft}px;
            top: ${this.el.offsetTop}px;
        `;

        return clone;
    }
}