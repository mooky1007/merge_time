import { Board } from "./Board.mjs";
import { Upgrade } from "./Upgrade.mjs";

class MergeFarm {
    constructor() {
        this.board = new Board('.board');
        this.upgrade = new Upgrade();
    }
}

export default MergeFarm;