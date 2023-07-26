class Board {
    constructor(el) {
        this.el = document.querySelector(el);
        this.blocks = new Array(49).fill(null);
        this.gold = 50;
        this.upgradeLevel = 0;
        this.orderList = [];
        this.maxOrder = 2;
        this.fame = 0;
        this.orderDuration = 10000;

        this.init();
        this.orderTimer();
        this.render();
    }

    init() {
        this.blocks.forEach((_, idx) => {
            this.blocks[idx] = new Block(idx);
        });

        this.el.innerHTML = '';
        this.blocks.forEach((block, idx) => {
            this.el.appendChild(block.el);

            block.el.addEventListener('click', e => {
                if(this.touchStart) return;

                // dobule click
                if(block.clicked) {
                    if(this.touchStart) return;
                    this.gold += block.data.level * 5;
                    block.data.level = null;
                    this.render();
                    return;
                }
    
                block.clicked = true;
                
                setTimeout(() => {
                    block.clicked = false;
                }, 300);
                
            })
    
            block.el.addEventListener('touchstart', e => {
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
                
            })

            block.el.addEventListener('dragenter', e => {
                document.querySelectorAll('.drag-on').forEach(el => {
                    el.classList.remove('drag-on');
                });
                block.el.classList.add('drag-on');
            })
    
            block.el.addEventListener('dragend', e => {
                if(!document.querySelector('.drag-on')) return;
    
                const fromEl = block;
                const toEl = this.blocks[document.querySelector('.drag-on').id];
    
                if(fromEl.id === toEl.id) {
                    toEl.el.classList.remove('drag-on');
                    return;
                }

                if(toEl.el.innerHTML !== ""){
                    if(toEl.data.level === fromEl.data.level){
                        toEl.data.level *= 2;
                        fromEl.data.level = null;
                    }else{
                        const temp = toEl.data.level;
                        toEl.data.level = fromEl.data.level;
                        fromEl.data.level = temp;
                    }
                }else{
                    const temp = toEl.data.level;
                    toEl.data.level = fromEl.data.level;
                    fromEl.data.level = temp;
                }
                this.render();
    
                toEl.el.classList.remove('drag-on');
            })

            block.el.addEventListener('touchstart', e => {
                this.touchPos = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                }
                
                this.touchedTarget = document.elementFromPoint(this.touchPos.x, this.touchPos.y);


                if(block.data.level === null) return;
                this.clone?.remove();

                this.touchStart = true;
                this.clone = block.createClone();
                this.el.appendChild(this.clone);
                block.el.style.opacity = 0.3;
            })

            block.el.addEventListener('touchend', e => {    
                this.blocks.forEach(block => {
                    block.el.classList.remove('touch_on');
                });

                this.touchPos = {
                    x: e.changedTouches[0].clientX,
                    y: e.changedTouches[0].clientY
                }
                this.touchedTarget = document.elementFromPoint(this.touchPos.x, this.touchPos.y);

                this.clone?.remove();

                if(!this.touchedTarget?.classList.contains('block')) return;
                // if(!document.querySelector('.drag-on')) return;

                const fromEl = block;
                const toEl = this.blocks[this.touchedTarget.id];
    
                console.log(fromEl, toEl);

                if(+fromEl.id === +toEl.id) {
                    block.el.style.opacity = 1;
                    this.clone?.remove();
                    this.touchStart = false;
                    return;
                }

                if(toEl.el.innerHTML !== ""){
                    if(toEl.data.level === fromEl.data.level){
                        toEl.data.level *= 2;
                        fromEl.data.level = null;
                    }else{
                        const temp = toEl.data.level;
                        toEl.data.level = fromEl.data.level;
                        fromEl.data.level = temp;
                    }
                }else{
                    const temp = toEl.data.level;
                    toEl.data.level = fromEl.data.level;
                    fromEl.data.level = temp;
                }
                this.render();

                this.touchStart = false;

                block.el.style.opacity = 1;
                this.clone?.remove();
            })
        });

        this.el.addEventListener('touchmove', e => {
            this.touchPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            }
            this.clone.style.left = `${this.touchPos.x - this.clone.offsetWidth/2}px`;
            this.clone.style.top = `${this.touchPos.y - this.clone.offsetHeight/2}px`;

            this.blocks.forEach(block => {
                block.el.classList.remove('touch_on');
            });
            this.touchedTarget = document.elementFromPoint(this.touchPos.x, this.touchPos.y);
            
            this.touchedTarget.classList.add('touch_on');
        })

        document.querySelector('#buyItem').addEventListener('click', e => {
            if(this.gold < 10) return;
            this.gold -= 10;
            this.createRandomBlock();
            this.render();
        })

        document.querySelector('#upgrade1').addEventListener('click', e => {
            if(this.gold <= 100) return;
            if(this.upgradeLevel >= 2) return;
            this.gold -= 100;
            this.upgradeLevel++;
            this.render();
        })

        document.querySelector('#upgrade2').addEventListener('click', e => {
            if(this.gold <= 500) return;
            if(this.orderDuration <= 3000) return;
            this.gold -= 500;
            this.orderDuration -= 1000;
            this.updateOrderTimer();
            this.render();
        });

        document.querySelector('#upgrade3').addEventListener('click', e => {
            if(this.gold <= 200) return;
            if(this.maxOrder >= 5) return;
            this.gold -= 200;
            this.maxOrder++;
            this.render();
        });
    }

    render() {
        this.blocks.forEach(block => {
            block.render();
        });
        document.querySelector('.gold').innerHTML = `${this.gold.toLocaleString()}원`;
        // document.querySelector('.up_level').innerHTML = this.upgradeLevel;
        // document.querySelector('.fame').innerHTML = this.fame;
        document.querySelector('.max_order').innerHTML = `${this.maxOrder}개`;
        // document.querySelector('.order_duration').innerHTML = `${this.orderDuration / 1000}초`;
    }

    createRandomBlock() {
        const emptyBlocks = this.blocks.filter(block => block.data.level === null);
        const randomBlock = emptyBlocks[Math.floor(Math.random() * emptyBlocks.length)];
        randomBlock.data.level = 2**[Math.floor(Math.random() * (this.upgradeLevel + 1))];
        randomBlock.render();
    }

    orderTimer() {
        const randomItem = Math.floor(Math.random() * ((Math.floor(this.fame/100) + 3) - 0) + 0);
        console.log(randomItem)

        if(this.orderList.length > 5) return;

        this.orderList.push(new OrderList({
            time: (randomItem + 1) * 15000,
            gold: 2**randomItem * 20,
            needItem: 2**randomItem,
            needCnt: Math.floor(Math.random() * (4 - 1) + 1)
        }));

        this.createOrderTimer();
    }

    createOrderTimer() {
        this.orderTimerObj = setInterval(() => {
            if(this.orderList.length > this.maxOrder) return;
            const randomItem = Math.floor(Math.random() * ((Math.floor(this.fame/20) + 2)));
            this.orderList.push(new OrderList({
                id: new Date().getTime(),
                time: (randomItem + 1) * 15000,
                gold: 2**randomItem * 20,
                needItem: 2**randomItem,
                needCnt: Math.floor(Math.random() * (4 - 1) + 1)
            }));
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
    }

    setLevel(level) {
        this.data.level = level;
    }

    render() {
        // this.el.innerHTML = this.data.level;
        switch(this.data.level) {
            case 1:
                this.el.innerHTML = "🍎"
                // this.el.style.backgroundColor = "#111";
                break;
            case 2:
                this.el.innerHTML = "🍊"
                // this.el.style.backgroundColor = "#111";
                break;
            case 4:
                this.el.innerHTML = "🍋"
                // this.el.style.backgroundColor = "#111";
                break;
            case 8:
                this.el.innerHTML = "🍉"
                // this.el.style.backgroundColor = "#111";
                break;
            case 16:
                this.el.innerHTML = "🍇"
                // this.el.style.backgroundColor = "#111";
                break;
            case 32:
                this.el.innerHTML = "🍓"
                // this.el.style.backgroundColor = "#111";
                break;
            case 64:
                this.el.innerHTML = "🍒"
                // this.el.style.backgroundColor = "#111";
                break;
            case 128:
                this.el.innerHTML = "🍑"
                // this.el.style.backgroundColor = "#111";
                break;
            case 256:
                this.el.innerHTML = "🍍"
                // this.el.style.backgroundColor = "#111";
                break;
            case 512:
                this.el.innerHTML = "🍌"
                // this.el.style.backgroundColor = "#111";
                break;
            case 1024:
                this.el.innerHTML = "🍐"
                // this.el.style.backgroundColor = "#111";
                break;
            case 2048:
                this.el.innerHTML = "🍈"
                // this.el.style.backgroundColor = "#111";
                break;
            case 4096:
                this.el.innerHTML = "🍏"
                // this.el.style.backgroundColor = "#111";
                break;
            case 8192:
                this.el.innerHTML = "🍅"
                // this.el.style.backgroundColor = "#111";
                break;
            default:
                this.el.innerHTML = ""
                break;
        }
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

        return clone;
    }
}

class OrderList {
    constructor(data) {
        this.id = data?.id || new Date().getTime();
        this.el = document.querySelector(`.order_list ul`);
        this.item = null;
        this.needCnt = data?.needCnt || 1;
        this.time = data?.time || 60000;

        this.data = data;

        this.emogeArr = {
            "1": "🍎",
            "2": "🍊",
            "4": "🍋",
            "8": "🍉",
            "16": "🍇",
            "32": "🍓",
            "64": "🍒",
            "128": "🍑",
            "256": "🍍",
            "512": "🍌",
            "1024": "🍐",
            "2048": "🍈",
            "4096": "🍏",
            "8192": "🍅"
        }
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
        
        li.appendChild(needItem);
        li.appendChild(buyPrice);
        li.appendChild(button);
        li.appendChild(time);
        time.appendChild(min);
        time.appendChild(sec);

        li.classList.add('order');
        needItem.classList.add('need_item');
        buyPrice.classList.add('buy_price');
        time.classList.add('time');
        min.classList.add('min');
        sec.classList.add('sec');

        needItem.innerHTML = this.emogeArr[this.data.needItem].repeat(this.data.needCnt);
        buyPrice.innerHTML = `${(+this.data.gold * +this.data.needCnt).toLocaleString()} 원`;
        button.innerHTML = '판매';
        min.innerHTML = this.data.time / 60000 > 9 ? Math.floor(this.data.time / 60000) : `0${Math.floor(this.data.time / 60000)}`;
        sec.innerHTML = this.data.time % 60000 > 9 ? Math.floor((this.data.time % 60000) / 1000) : `0${Math.floor((this.data.time % 60000) / 1000)}`;

        button.addEventListener('click', e => {
            if(board.blocks.filter(block => +block.data.level === +this.data.needItem).length < this.data.needCnt) return;

            board.gold += (+this.data.gold * +this.data.needCnt);
            board.fame += Math.floor((+this.data.gold * +this.data.needCnt)/10);
            if(board.fame > 1000){ board.fame = 1000; }

            let cnt = 0;

            for(let i = 0; i < board.blocks.length; i++) {
                if(+board.blocks[i].data.level === +this.data.needItem) {
                    board.blocks[i].data.level = null;
                    cnt++;

                    if(cnt === this.data.needCnt) {
                        break;
                    }
                }
            }

            this.item.remove();
            board.orderList = board.orderList.filter(order => order.id !== this.id);
            board.render();
            this.render();
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
    }
}