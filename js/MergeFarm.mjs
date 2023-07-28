import { Board } from "./Board.mjs";
import { Upgrade } from "./Upgrade.mjs";

class MergeFarm {
    constructor() {
        this.energy = 0;
        this.maxEnergy = 100;
        this.gold = 0;
        this.fame = 0;
        this.fameLevel = 0;

        this.board = new Board('.board');
        this.upgrade = new Upgrade();

        this.board.parent = this;
        
    }
}

export default MergeFarm;



// // HOME 메뉴 클릭 이벤트
        // home_menu.addEventListener("click", () => {
        //     window.history.pushState("", "", "/web/");
        //     const urlChange = new CustomEvent("urlchange", {
        //         detail: { href: "/web/" }
        //     });
        //     document.dispatchEvent(urlChange);
        // });

// // SIGNUP 메뉴 클릭 이벤트
        // signup_menu.addEventListener("click", () => {
        //     window.history.pushState("", "", "/web/signup");
        //     const urlChange = new CustomEvent("urlchange", {
        //         detail: { href: "/web/signup" }
        //     });
        //     document.dispatchEvent(urlChange);
        // });

// document.addEventListener("urlchange", (e) => {
//     let pathname = e.detail.href;

//     switch(pathname) {
//         case "/web/":
//             homePage.render();
//             break;
//         case "/web/signup":
//             signupPage.render();
//             break;
//         default:
//     }
// });