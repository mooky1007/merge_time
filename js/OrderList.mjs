export class OrderList {
    constructor(data, board) {
        this.board = board;
        this.id = data?.id || new Date().getTime();
        this.container = document.querySelector(`.order_list ul`);
        this.item = null;

        this.level = data.item.level || null;
        this.time = data?.time || (data.item.level * 30000) + (this.board.orderLastTime * 5000);
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

            clearInterval(this.timer);
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
        const { board } = this;
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
        this.board.saveBoard();
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
        this.board.fame -= Math.floor((+this.price / 20));
        if(this.board.fame < 0) this.board.fame = 0;
        this.board.render();
    }
}