class Board {
    constructor(el) {
        this.el = document.querySelector(el);
        this.blocks = new Array(49).fill(null);
        this.gold = 50;
        this.upgradeLevel = 0;
        this.orderList = [];
        this.maxOrder = 2;
        this.fame = 0;
        this.orderDuration = 12000;
        this.orderLastTime = 0;
        this.emogeArr = ["🍎","🍊","🍋","🍉","🍇","🍓","🍒","🍑","🍍","🍌","🍐","🍈","🍏","🍅"]

        this.buttons = {
            buyItem: document.querySelector('#buyItem'),
            upgrade1: document.querySelector('#upgrade1'),
            upgrade2: document.querySelector('#upgrade2'),
            upgrade3: document.querySelector('#upgrade3'),
            upgrade4: document.querySelector('#upgrade4')
        }

        this.init();
        this.orderTimer();
        this.render();
    }

    init() {
        this.blocks.forEach((_, idx) => {
            this.blocks[idx] = new Block(idx, this);
            this.el.appendChild(this.blocks[idx].el);

            const tile = document.createElement('div');
            tile.classList.add('tile');
            document.querySelector('.tiles').appendChild(tile);
        });

        this.setMouseEvent();
        this.setTouchEvent();

        this.buttons.buyItem.addEventListener('click', e => {
            if(this.gold < 10) return;
            this.gold -= 10;
            this.createRandomBlock();
            this.render();
        })

        this.buttons.upgrade1.addEventListener('click', e => {
            if(this.gold <= this.upgradeLevel * 200 + 200) return;
            if(this.upgradeLevel >= 4) {
                this.buttons.upgrade1.style.display = "none";
                return;
            };
            this.gold -= this.upgradeLevel * 200 + 200;
            this.upgradeLevel++;
            this.render();
        })

        this.buttons.upgrade2.addEventListener('click', e => {
            if(this.gold <= ((16000 - this.orderDuration)/1000 + 1) * 1000) return;
            if(this.orderDuration <= 5000){
                this.buttons.upgrade2.style.display = "none";
                return;
            };
            this.gold -= ((16000 - this.orderDuration)/1000 + 1) * 1000;
            this.orderDuration -= 1000;
            this.updateOrderTimer();
            this.render();
        });

        this.buttons.upgrade3.addEventListener('click', e => {
            if(this.gold <= ((2 - this.maxOrder) * 200) + 200) return;
            if(this.maxOrder >= 5){
                this.buttons.upgrade3.style.display = "none";
                return;
            };
            this.gold -= ((2 - this.maxOrder) * 200) + 200;
            this.maxOrder++;
            this.render();
        });

        this.buttons.upgrade4.addEventListener('click', e => {
            if(this.gold <= this.orderLastTime * 300 + 200) return;
            if(this.orderLastTime >= 5) {
                this.buttons.upgrade4.style.display = "none";
                return;
            };
            this.gold -= this.orderLastTime * 300 + 200;
            this.orderLastTime++;
            this.render();
        });
    }

    render() {
        this.blocks.forEach(block => block.render());
        document.querySelector('.gold').innerHTML = `${this.gold.toLocaleString()}`;
        this.buttons.upgrade1.querySelector('.price').innerHTML = (this.upgradeLevel * 200 + 200).toLocaleString();
        this.buttons.upgrade2.querySelector('.price').innerHTML = (((16000 - this.orderDuration)/1000 + 1) * 1000).toLocaleString();
        this.buttons.upgrade3.querySelector('.price').innerHTML = (((2 - this.maxOrder) * 200) + 200).toLocaleString();
        this.buttons.upgrade4.querySelector('.price').innerHTML = (this.orderLastTime * 300 + 200).toLocaleString();
        // document.querySelector('.max_order').innerHTML = `${this.maxOrder}개`;
        // document.querySelector('.up_level').innerHTML = this.upgradeLevel;
        // document.querySelector('.fame').innerHTML = this.fame;
        // document.querySelector('.order_duration').innerHTML = `${this.orderDuration / 1000}초`;
    }

    setMouseEvent() {
        this.blocks.forEach((block, idx) => {
            block.el.addEventListener('click', e => this.dobleClick(block));
            block.el.addEventListener('dragenter', e => this.dragEnter(block));
            block.el.addEventListener('dragend', e => this.dragEnd(block));
        });
    }

    setTouchEvent() {
        this.blocks.forEach((block, idx) => {
            block.el.addEventListener('touchstart', e => this.doubleTouch(block));
            block.el.addEventListener('touchstart', e => this.touchStart(e, block));
            block.el.addEventListener('touchend', e => this.touchDrop(e, block));
        });

        this.el.addEventListener('touchmove', e => this.touchMove(e));
    }

    dobleClick(block) {
        if(this.isTouchStart) return;

        if(block.clicked) {
            if(this.isTouchStart) return;
            this.gold += block.data.level * 5;
            block.data.level = null;
            this.render();
            return;
        }

        block.clicked = true;
        
        setTimeout(() => {
            block.clicked = false;
        }, 300);
    }

    dragEnter(block) {
        document.querySelectorAll('.drag-on').forEach(el => {
            el.classList.remove('drag-on');
        });
        block.el.classList.add('drag-on');
    }

    dragEnd(block) {
        if(!document.querySelector('.drag-on')) return;

        const fromEl = block;
        const toEl = this.blocks[document.querySelector('.drag-on').id];

        if(fromEl.id === toEl.id) {
            toEl.el.classList.remove('drag-on');
            return;
        }

        toEl.el.innerHTML !== ""
        && toEl.data.level === fromEl.data.level
            ? this.mergeItem(fromEl, toEl)
            : this.changeItem(fromEl, toEl);
    }

    doubleTouch(block) {
        block.el.classList.remove('drag-on');

        if(block.data.level === null) return;
        // dobule touch
        if(block.touched) {
            this.gold += block.data.level * 5;
            block.data.level = null;
            this.render();
            return;
        }

        block.touched = true;
        
        setTimeout(() => {
            block.touched = false;
        }, 300);
    }

    mergeItem(from, to){
        to.data.level += 1;
        from.data.level = null;
        to.el.classList.add('scaleUp');
        this.render();
        setTimeout(() => {
            to.el.classList.remove('scaleUp');
        }, 500);
    }

    changeItem(from, to) {
        const temp = to.data.level;
        to.data.level = from.data.level;
        from.data.level = temp;

        to.el.classList.remove('drag-on');
        this.render();
    }

    touchMove(e){
        e.preventDefault();
        this.setTouchPosition(e);

        if(!this.clone) return;
        this.clone.style.left = `${this.touchPos.x - this.clone.offsetWidth/2}px`;
        this.clone.style.top = `${this.touchPos.y - this.clone.offsetHeight}px`;

        this.clearTouchOn();
        this.touchedTarget = document.elementFromPoint(this.touchPos.x, this.touchPos.y);
        
        if(!this.touchedTarget?.classList.contains('block')) {
            this.clone?.remove();
            this.blocks.forEach(block => {
                block.el.style = "";
            }); 
            return;
        }

        this.touchedTarget.classList.add('touch_on');
    }

    touchStart(e, block) {
        e.preventDefault();
        console.log(block)

        this.setTouchPosition(e);
        this.touchedTarget = document.elementFromPoint(this.touchPos.x, this.touchPos.y);


        if(block.data.level === null) return;
        this.clone?.remove();

        this.isTouchStart = true;
        this.clone = block.createClone();
        this.el.appendChild(this.clone);
        block.el.style.opacity = 0.3;
    }

    touchDrop(e, block) {
        e.preventDefault();
        this.clearTouchOn();

        this.touchedTarget = document.elementFromPoint(this.touchPos.x, this.touchPos.y);
        this.clone?.remove();

        if(!this.touchedTarget?.classList.contains('block')) return;

        const fromEl = block;
        const toEl = this.blocks[this.touchedTarget.id];

        if(+fromEl.id === +toEl.id) {
            block.el.style.opacity = 1;
            this.clone?.remove();
            this.isTouchStart = false;
            return;
        }

        toEl.el.innerHTML !== ""
        && toEl.data.level === fromEl.data.level
            ? this.mergeItem(fromEl, toEl)
            : this.changeItem(fromEl, toEl);

        this.isTouchStart = false;

        block.el.style.opacity = 1;
        this.clone?.remove();
    }

    setTouchPosition(e) {
        this.touchPos = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        }
    }

    clearTouchOn() {
        this.blocks.forEach(block => {
            block.el.classList.remove('touch_on');
        });
    }

    createRandomBlock() {
        const emptyBlocks = this.blocks.filter(block => block.data.level === null);
        const randomBlock = emptyBlocks[Math.floor(Math.random() * emptyBlocks.length)];
        randomBlock.data.level = Math.floor(Math.random() * (this.upgradeLevel + 1) + 1);
        randomBlock.el.classList.add('scaleUp');
        randomBlock.render();
        setTimeout(() => {
            randomBlock.el.classList.remove('scaleUp');
        }, 500);
    }

    createOrderItem() {
        const randomItem = Math.floor(Math.random() * ((Math.floor(this.fame/500) + 3)));

        this.orderList.push(new OrderList({
            time: (randomItem + 1) * 15000 + this.orderLastTime * 5000,
            gold: (randomItem + 1) * 20,
            needItem: randomItem,
            needCnt: Math.floor(Math.random() * (5 - 1) + 1)
        }, this));
    }

    orderTimer() {
        if(this.orderList.length >= this.maxOrder) return;

        this.createOrderItem();
        this.createOrderTimer();
    }

    createOrderTimer() {
        this.orderTimerObj = setInterval(() => {
            if(this.orderList.length > this.maxOrder) return;
            this.createOrderItem();
            this.orderList.forEach(order => order.render());
        }, this.orderDuration);
    }

    deleteOrderTimer() {
        clearInterval(this.orderTimerObj);
    }

    updateOrderTimer() {
        this.deleteOrderTimer();
        this.createOrderTimer();
    }
}

class Block {
    constructor(id, board) {
        this.board = board;
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
    }

    render() {
        this.el.innerHTML = this.board.emogeArr[this.data.level - 1] || "";
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

class OrderList {
    constructor(data, board) {
        this.id = data?.id || new Date().getTime();
        this.el = document.querySelector(`.order_list ul`);
        this.item = null;
        this.needCnt = data?.needCnt || 1;
        this.time = data?.time || 60000;
        this.board = board;

        this.data = data;
        this.init();
    }

    init() {
        this.create();

        this.timer = setInterval(() => {
            this.time -= 1000;
            if(this.time <= 0) {
                board.orderList = board.orderList.filter(order => order.id !== this.id);
                this.item.remove();
                clearInterval(this.timer);
                return;
            }
            this.render();
        }, 1000);
    }

    create() {
        const li = document.createElement('li');
        const needItem = document.createElement('span');
        const buyPrice = document.createElement('span');
        const time = document.createElement('p');
        const min = document.createElement('span');
        const sec = document.createElement('span');
        const button = document.createElement('button');
        const button2 = document.createElement('button');
        
        li.appendChild(needItem);
        li.appendChild(buyPrice);
        li.appendChild(button);
        li.appendChild(button2);
        li.appendChild(time);
        time.appendChild(min);
        time.appendChild(sec);

        li.classList.add('order');
        needItem.classList.add('need_item');
        buyPrice.classList.add('buy_price');
        time.classList.add('time');
        min.classList.add('min');
        sec.classList.add('sec');

        // needItem.innerHTML = this.board.emogeArr[this.data.needItem].repeat(this.data.needCnt);
        needItem.innerHTML = `${this.board.emogeArr[this.data.needItem]} <span class="cnt_num">x ${this.data.needCnt}</span>`
        buyPrice.innerHTML = `${(+this.data.gold * +this.data.needCnt).toLocaleString()}<span style="font-size:10px;">원</span>`;
        button.innerHTML = '판매';
        button.classList.add('sell');
        button2.innerHTML = '삭제';
        button2.style.marginLeft = "0";
        min.innerHTML = this.data.time / 60000 > 9 ? Math.floor(this.data.time / 60000) : `0${Math.floor(this.data.time / 60000)}`;
        sec.innerHTML = this.data.time % 60000 > 9 ? Math.floor((this.data.time % 60000) / 1000) : `0${Math.floor((this.data.time % 60000) / 1000)}`;

        button.addEventListener('click', e => {
            if(this.board.blocks.filter(block => +block.data.level === +(this.data.needItem + 1)).length < this.data.needCnt) return;

            this.board.gold += (+this.data.gold * +this.data.needCnt);
            this.board.fame += Math.floor((+this.data.gold * +this.data.needCnt)/10);
            if(this.board.fame > 1000){ board.fame = 1000; }

            let cnt = 0;

            for(let i = 0; i < board.blocks.length; i++) {
                if(+board.blocks[i].data.level === +(this.data.needItem + 1)) {
                    board.blocks[i].data.level = null;
                    cnt++;

                    if(cnt === this.data.needCnt) break;
                }
            }

            this.item.remove();
            this.board.orderList = this.board.orderList.filter(order => order.id !== this.id);
            this.board.render();
            this.render();
        });

        button2.addEventListener('click', e => {
            if(this.board.gold < 5) return;
            this.item.remove();
            this.board.orderList = this.board.orderList.filter(order => order.id !== this.id);
            this.board.gold -= 5;
            this.render();
            this.board.render();
        });

        this.item = li;
        this.el.appendChild(li);
    }

    render() {
        const timeEl =  this.item.querySelector('.time');
        const min = this.item.querySelector('.min');
        const sec = this.item.querySelector('.sec');

        if(this.time <= 5000) {
            timeEl.style.color = "#f00";
        }else {
            timeEl.style.color = "#fff";
        }

        min.innerHTML = Math.floor(this.time / 60000) > 9 ? Math.floor(this.time / 60000) : `0${Math.floor(this.time / 60000)}`;
        sec.innerHTML = Math.floor((this.time % 60000) / 1000) > 9 ? Math.floor((this.time % 60000) / 1000) : `0${Math.floor((this.time % 60000) / 1000)}`;

        if(this.board.orderList.length === 0) this.el.classList.add('no-order');
        else this.el.classList.remove('no-order');
    }
}