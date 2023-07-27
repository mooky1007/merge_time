class Board {
    constructor(el) {
        this.defaultConfig = {
            orderDuration : 10000,
            gold : 50,
            fame : 0,
            fameLevel : 0,
            orderLastTime : 0,
            maxOrder : 2
        }

        this.container = document.querySelector('.squre');
        this.el = document.querySelector(el);
        this.blocks = new Array(49).fill(null);
        this.modal = document.querySelector('.modal_layer');
        this.gold = this.defaultConfig.gold;
        this.orderList = [];
        this.fame = this.defaultConfig.fame;
        this.fameLevel = this.defaultConfig.fameLevel;
        this.orderDuration = this.defaultConfig.orderDuration;
        this.orderLastTime = this.defaultConfig.orderLastTime;
        this.emogeArr = ["🍎","🍊","🍋","🍉","🍇","🍓","🍒","🍑","🍍","🍌","🍐","🍈","🍏","🍅"]

        this.upgradeLevel = {
            newItem: 0,
            maxOrder: 0,
            orderSpeed: 0,
            orderLastTime: 0
        }

        this.buttons = {
            buyItem: document.querySelector('#buyItem'),
            upgradeModal: document.querySelector('#upgradeModal'),
            upgrade1: document.querySelector('#upgrade1'),
            upgrade2: document.querySelector('#upgrade2'),
            upgrade3: document.querySelector('#upgrade3'),
            upgrade4: document.querySelector('#upgrade4')
        }

        this.init();
        this.orderTimer();

        // this.devModeTest();
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

        this.buttons.upgradeModal.addEventListener('click', e => {
            this.modal.classList.toggle('hide');
        })

        this.modal.querySelector('.close').addEventListener('click', e => {
            this.modal.classList.toggle('hide');
        })

        this.buttons.upgrade1.addEventListener('click', e => {
            if(this.gold <= this.upgradeLevel.newItem * 400 + 400) return;
            if(this.upgradeLevel.newItem >= 4) {
                this.buttons.upgrade1.style.display = "none";
                return;
            };
            this.gold -= this.upgradeLevel.newItem * 400 + 400;
            this.upgradeLevel.newItem ++;
            this.render();
        })

        this.buttons.upgrade2.addEventListener('click', e => {
            if(this.gold <= ((this.defaultConfig.orderDuration - this.orderDuration)/1000 + 1) * 500) return;
            if(this.orderDuration <= 3000){
                this.buttons.upgrade2.style.display = "none";
                return;
            };
            this.gold -= ((this.defaultConfig.orderDuration - this.orderDuration)/1000 + 1) * 500;
            this.orderDuration -= 1000;
            this.updateOrderTimer();
            this.render();
        });

        this.buttons.upgrade3.addEventListener('click', e => {
            if(this.gold <= ((this.upgradeLevel.maxOrder) * 300) + 300) return;
            if(this.upgradeLevel.maxOrder >= 5){
                this.buttons.upgrade3.style.display = "none";
                return;
            };
            this.gold -= ((this.upgradeLevel.maxOrder) * 300) + 300;
            this.upgradeLevel.maxOrder++;
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
        this.buttons.upgrade1.querySelector('.price').innerHTML = (this.upgradeLevel.newItem * 400 + 400).toLocaleString();
        this.buttons.upgrade2.querySelector('.price').innerHTML = (((this.defaultConfig.orderDuration - this.orderDuration)/1000 + 1) * 500).toLocaleString();
        this.buttons.upgrade3.querySelector('.price').innerHTML = (((this.upgradeLevel.maxOrder) * 300) + 300).toLocaleString();
        this.buttons.upgrade4.querySelector('.price').innerHTML = (this.orderLastTime * 300 + 200).toLocaleString();
        document.querySelector('.fame').innerHTML = this.fame.toLocaleString();
        document.querySelector('.fameLevel').innerHTML = (this.fameLevel + 1).toLocaleString();
        // document.querySelector('.max_order').innerHTML = `${this.maxOrder}개`;
        // document.querySelector('.up_level').innerHTML = this.upgradeLevel;
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

        this.container.addEventListener('touchstart', e => e.preventDefault());
        this.container.addEventListener('touchmove', e => this.touchMove(e));
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
        to.setLevel(to.data.level + 1);
        from.data.level = null;
        to.el.classList.add('scaleUp');
        this.render();
        setTimeout(() => {
            to.el.classList.remove('scaleUp');
        }, 500);
    }

    changeItem(from, to) {
        const temp = to.data.level;
        to.setLevel(from.data.level);
        from.setLevel(temp);

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
        e.preventDefault()

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

        if(emptyBlocks.length === 0) return;

        const emptyBlocks1 = emptyBlocks.filter(block => block.id < 21);
        const emptyBlocks2 = emptyBlocks.filter(block => block.id >= 21 && block.id < 35);
        const emptyBlocks3 = emptyBlocks.filter(block => block.id >= 35 && block.id < 49);

        let randomBlock
        if(emptyBlocks3.length > 7){
            randomBlock = emptyBlocks3[Math.floor(Math.random() * emptyBlocks3.length)];
        }else if(emptyBlocks2.length > 7){
            randomBlock = [...emptyBlocks3, ...emptyBlocks2][Math.floor((Math.random() * emptyBlocks2.length))];
        }else if(emptyBlocks1.length !== 0){
            randomBlock = emptyBlocks[Math.floor(Math.random() * emptyBlocks1.length)];
        }

        randomBlock.setLevel(Math.floor(Math.random() * (this.upgradeLevel.newItem + 1) + 1));
        randomBlock.el.classList.add('scaleUp');
        randomBlock.render();
        setTimeout(() => {
            randomBlock.el.classList.remove('scaleUp');
        }, 500);
    }

    getFameLevel() {
        if(this.fame < 0){
            this.fameLevel = 0;
            return;
        }

        const fameLevel = Math.floor(Math.log2(this.fame / 200)) + 1;
        this.fameLevel = fameLevel < 0 ? 0 : fameLevel;
    }

    createOrderItem() {
        this.getFameLevel();
        let randomItem = Math.floor(Math.random() * (this.fameLevel + 2)) + 1;

        this.orderList.push(new OrderList({
            qty: Math.floor(Math.random() * (5 - 1) + 1),
            item: new Block(null, this).setLevel(+randomItem)
        }, this));
    }

    orderTimer() {
        this.createOrderItem();
        this.createOrderTimer();
    }

    createOrderTimer() {
        this.orderTimerObj = setInterval(() => {
            if(this.orderList.length >= (2 + this.upgradeLevel.maxOrder)) return;
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

    // devModeTest() {
    //     for(let i = 0; i < this.emogeArr.length; i++) {
    //         this.blocks[i].setLevel(i + 1);
    //     }
    // }
}

class Block {
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
        this.data.price = Math.trunc(2**(level - 1) * 20 * (1 + +this.board.fameLevel / 10));
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

class OrderList {
    constructor(data, board) {
        this.board = board;
        this.id = data?.id || new Date().getTime();
        this.container = document.querySelector(`.order_list ul`);
        this.item = null;

        this.level = data.item.level || null;
        this.time = (data.item.level * 30000) + (this.board.orderLastTime * 5000);
        this.qty = data?.qty || 1;
        this.price = (+data.item.price * +this.qty);

        this.init();
    }

    init() {
        this.create();

        this.timer = setInterval(() => {
            this.time -= 1000;
            if(this.time <= 0) {
                this.removeOrder();
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

        needItem.innerHTML = `${this.board.emogeArr[this.level - 1]} <span class="cnt_num">x ${this.qty}</span>`
        buyPrice.innerHTML = `${this.price.toLocaleString()}<span style="font-size:10px;">원</span>`;
        button.innerHTML = '판매';
        button.classList.add('sell');
        button2.innerHTML = '삭제';
        button2.style.marginLeft = "0";
        min.innerHTML = this.time / 60000 > 9 ? Math.floor(this.time / 60000) : `0${Math.floor(this.time / 60000)}`;
        sec.innerHTML = this.time % 60000 > 9 ? Math.floor((this.time % 60000) / 1000) : `0${Math.floor((this.time % 60000) / 1000)}`;

        button.addEventListener('click', e => {
            if(this.board.blocks.filter(block => +block.data.level === +this.level).length < this.qty) return;
            
            this.sellItem();

            this.item.remove();
            this.board.orderList = this.board.orderList.filter(order => order.id !== this.id);
            this.board.render();
            this.render();
        });

        button2.addEventListener('click', e => {
            if(this.board.gold < 5) return;
            this.board.gold -= 5;
            this.removeOrder();
        });

        this.item = li;
        this.container.appendChild(li);
    }

    sellItem() {
        let cnt = 0;
        for(let i = 0; i < board.blocks.length; i++) {
            if(+board.blocks[i].data.level === +this.level) {
                this.board.gold += board.blocks[i].data.price;
                this.board.fame += board.blocks[i].data.fame;
                board.blocks[i].setLevel(null);
                cnt++;

                if(cnt === this.qty) break;
            }
        }
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

        if(this.board.orderList.length === 0) this.container.classList.add('no-order');
        else this.container.classList.remove('no-order');
    }

    removeOrder() {
        this.item.remove();
        this.board.orderList = this.board.orderList.filter(order => order.id !== this.id);
        this.render();
        this.board.fame -= Math.floor((+this.price / 5));
        if(this.board.fame < 0) this.board.fame = 0;
        this.board.render();
    }
}