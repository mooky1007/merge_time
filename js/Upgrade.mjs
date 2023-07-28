export class Upgrade {
    constructor() {
        this.el = document.querySelector('.upgrade');
        this.upgradeList = [];

        this.init();
    }

    init(){
        this.upgradeList.push(
            new UpgradeItem({
                name: "생산성",
                description: "생산성을 1 증가시킵니다.",
                cost: 100,
            })
        )
    }
}

class UpgradeItem {
    constructor(config) {
        this.config = config;

        this.init();
    }

    init() {}
}