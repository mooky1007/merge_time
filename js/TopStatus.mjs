export class TopStatus {
    constructor(el) {
        this.container = document.querySelector(el);
    }

    createTopStatus() {}
}

// <div class="status">
//     <p style="margin-right: auto;">
//         <span class="tossFace">👑</span>
//         <span class="fameLevel">0</span>
//     </p>
//     <p style="margin-right: 10px;">
//         <span class="tossFace">❤</span>
//         <span class="energy">0</span>
//         <span>/</span>
//         <span class="max_energy">100</span>
//     </p>
//     <p style="margin-right: 10px;">
//         <span class="tossFace">💫</span>
//         <span class="fame">0</span>
//     </p>
//     <p>
//         <span class="tossFace">💰</span>
//         <span class="gold">0</span>
//         <span style="font-size:12px;">원</span>
//     </p>
// </div>;

class StatusItem {
    constructor(...args) {
        const {icon, type} = args;
    }

    createStatusItem() {
        const statusItem = document.createElement('div');
        const icon = document.createElement('span');
        const value = document.createElement('span');

        statusItem.classList.add('statusItem');
        icon.classList.add('tossFace');
        

        return statusItem;
    }
}
