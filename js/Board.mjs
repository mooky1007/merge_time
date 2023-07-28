import { BoardItem } from "./BoardItem.mjs";
import { OrderList } from "./OrderList.mjs";

export class Board {
    constructor(el) {
        this.defaultConfig = {
            orderDuration : 10000,
            gold : 100,
            fame : 0,
            fameLevel : 0,
            orderLastTime : 0,
            maxOrder : 2
        }

        this.container = document.querySelector('.squre');
        this.el = document.querySelector(el);
        this.blocks = new Array(49).fill(null);
        this.modal = document.querySelector('#upgradeModalLayer');
        this.inforModal = document.querySelector('#inforModalLayer');
        this.gold = this.defaultConfig.gold;
        this.orderList = [];
        this.fame = this.defaultConfig.fame;
        this.fameLevel = this.defaultConfig.fameLevel;
        this.orderDuration = this.defaultConfig.orderDuration;
        this.orderLastTime = this.defaultConfig.orderLastTime;
        this.emogeArr = ["🍎","🍊","🍋","🍉","🍇","🍒","🍑","🍌","🍈","🥗","🥚","🐣","🐥","🐔","🐷","🥓","🐮","🥩"]

        this.upgradeLevel = {
            newItem: 0,
            maxOrder: 0,
            orderSpeed: 0,
            orderLastTime: 0
        }

        this.upgradeConfig = {
            formula: (upgradeLevel, upgradePrice, pow = 3) => { return pow**(upgradeLevel) * upgradePrice},
            newItem: {
                price: 500,
                maxLevel: 10,
            },
            maxOrder: {
                price: 500,
                maxLevel: 10,
            },
            orderSpeed: {
                price: 1000,
                maxLevel: 4,
                pow: 5,
            },
            orderLastTime: {
                price: 500,
                maxLevel: 20,
            }
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
            this.blocks[idx] = new BoardItem(idx, this);
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
            const nextPrice = this.upgradeConfig.formula(this.upgradeLevel.newItem, this.upgradeConfig.newItem.price);
            if(this.gold <= nextPrice) return;
            this.gold -= nextPrice;
            this.upgradeLevel.newItem ++;
            this.render();
        })

        this.buttons.upgrade2.addEventListener('click', e => {
            const nextPrice = this.upgradeConfig.formula(this.upgradeLevel.orderSpeed, this.upgradeConfig.orderSpeed.price, this.upgradeConfig.orderSpeed.pow);
            if(this.gold <= nextPrice) return;
            this.gold -= nextPrice;
            this.upgradeLevel.orderSpeed ++;
            this.orderDuration = this.defaultConfig.orderDuration - (this.upgradeLevel.orderSpeed * 1000);
            this.updateOrderTimer();
            this.render();
        });

        this.buttons.upgrade3.addEventListener('click', e => {
            const nextPrice = this.upgradeConfig.formula(this.upgradeLevel.maxOrder, this.upgradeConfig.maxOrder.price);
            if(this.gold <= nextPrice) return;
            this.gold -= nextPrice;
            this.upgradeLevel.maxOrder++;
            this.render();
        });

        this.buttons.upgrade4.addEventListener('click', e => {
            const nextPrice = this.upgradeConfig.formula(this.orderLastTime, this.upgradeConfig.orderLastTime.price);
            if(this.gold <= nextPrice) return;
            this.gold -= nextPrice;
            this.orderLastTime++;
            this.render();
        });

        this.loadBoard();
        this.render();
    }

    render() {
        this.blocks.forEach(block => block.render());
        document.querySelector('.gold').innerHTML = `${this.gold.toLocaleString()}`;
        this.buttons.upgrade1.querySelector('.price').innerHTML = this.upgradeConfig.formula(this.upgradeLevel.newItem, this.upgradeConfig.newItem.price).toLocaleString();
        this.buttons.upgrade2.querySelector('.price').innerHTML = this.upgradeConfig.formula(this.upgradeLevel.orderSpeed, this.upgradeConfig.orderSpeed.price, this.upgradeConfig.orderSpeed.pow).toLocaleString();
        this.buttons.upgrade3.querySelector('.price').innerHTML = this.upgradeConfig.formula(this.upgradeLevel.maxOrder, this.upgradeConfig.maxOrder.price).toLocaleString();
        this.buttons.upgrade4.querySelector('.price').innerHTML = this.upgradeConfig.formula(this.orderLastTime, this.upgradeConfig.orderLastTime.price).toLocaleString();
        document.querySelector('.fame').innerHTML = this.fame.toLocaleString();
        document.querySelector('.fameLevel').innerHTML = (this.fameLevel + 1).toLocaleString();
        // document.querySelector('.max_order').innerHTML = `${this.maxOrder}개`;
        // document.querySelector('.up_level').innerHTML = this.upgradeLevel;
        // document.querySelector('.order_duration').innerHTML = `${this.orderDuration / 1000}초`;

        if(+this.upgradeLevel.newItem >= +this.upgradeConfig.newItem.maxLevel) {
            this.buttons.upgrade1.style.display = "none";
            return;
        };

        if(+this.upgradeLevel.orderSpeed >= +this.upgradeConfig.orderSpeed.maxLevel) {
            this.buttons.upgrade2.style.display = "none";
            return;
        };

        if(+this.upgradeLevel.maxOrder >= +this.upgradeConfig.maxOrder.maxLevel) {
            this.buttons.upgrade3.style.display = "none";
            return;
        };

        if(+this.orderLastTime >= +this.upgradeConfig.orderLastTime.maxLevel) {
            this.buttons.upgrade4.style.display = "none";
            return;
        };

        this.saveBoard();
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
        }else if(emptyBlocks.length !== 0){
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
        this.render();
    }

    orderTimer() {
        this.createOrderTimer();
    }

    createOrderItem() {
        this.getFameLevel();
        let randomItem = Math.floor(Math.random() * (this.fameLevel + 2)) + 1;

        this.orderList.push(new OrderList({
            qty: Math.floor(Math.random() * (3 + (this.fameLevel + 1) - randomItem)) + 1,
            item: new BoardItem(null, this).setLevel(+randomItem)
        }, this));
    }


    createOrderTimer() {
        this.orderTimerObj = setInterval(() => {
            if(this.orderList.length >= (2 + this.upgradeLevel.maxOrder)) return;
            this.createOrderItem();
            this.orderList.forEach(order => order.render());
            this.saveBoard();
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

    clearOrderList() {
        this.orderList.forEach(order => order.removeOrder());
    }

    saveBoard() {
        localStorage.setItem('blocks', JSON.stringify(this.blocks.map(el => el.data.level)));
        localStorage.setItem('gold', this.gold);
        localStorage.setItem('fame', this.fame);
        localStorage.setItem('fameLevel', this.fameLevel);
        localStorage.setItem('orderDuration', this.orderDuration);
        localStorage.setItem('orderLastTime', this.orderLastTime);
        localStorage.setItem('maxOrder', this.maxOrder);
        localStorage.setItem('upgradeLevel', JSON.stringify(this.upgradeLevel));

        localStorage.setItem('orderList', JSON.stringify(this.orderList.map(order => {
            return {
                id: +order.id,
                item: {
                    level: +order.level,
                    price: +order.price / +order.qty
                },
                qty: +order.qty,
                time: +order.time
            }
        })));
    }

    loadBoard() {
        this.clearOrderList();

        localStorage.getItem('blocks') && this.blocks.forEach((block, idx) => {
            const data = JSON.parse(localStorage.getItem('blocks'))[idx];
            block.setLevel(data);
        });
        localStorage.getItem('gold') && (this.gold = +localStorage.getItem('gold'));
        localStorage.getItem('fame') && (this.fame = +localStorage.getItem('fame'));
        localStorage.getItem('fameLevel') && (this.fameLevel = +localStorage.getItem('fameLevel'));
        localStorage.getItem('orderDuration') && (this.orderDuration = +localStorage.getItem('orderDuration'));
        localStorage.getItem('orderLastTime') && (this.orderLastTime = +localStorage.getItem('orderLastTime'));
        localStorage.getItem('maxOrder') && (this.maxOrder = +localStorage.getItem('maxOrder'));
        localStorage.getItem('upgradeLevel') && (this.upgradeLevel = JSON.parse(localStorage.getItem('upgradeLevel')));

        localStorage.getItem('orderList') && JSON.parse(localStorage.getItem('orderList')).forEach(order => {
            const orederItem = new OrderList(order, this);
            orederItem.container.classList.remove('no-order');
            this.orderList.push(orederItem);
        });

        this.render();
    }

    deleteLocalStorage() {
        localStorage.removeItem('blocks');
        localStorage.removeItem('gold');
        localStorage.removeItem('fame');
        localStorage.removeItem('fameLevel');
        localStorage.removeItem('orderDuration');
        localStorage.removeItem('orderLastTime');
        localStorage.removeItem('maxOrder');
        localStorage.removeItem('upgradeLevel');
        localStorage.removeItem('orderList');
    }
}
