const Btn = {
    UNDO: "undo",
    REDO: "redo",
    MODE: "mode",
    ADDP: "add?",
    BP:   "+b",
    BM:   "-b",
    WP:   "+w",
    WM:   "-w",
}

const Edit = {
    ADD: 0,
    SUB: 1,
}

const Mode = {
    PLAY: 0,
    EDIT: 1,
}

const Player = {
    B: 0,
    W: 1,
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Board {
    constructor(size, ctx) {
        this.state = new Array(size * size).fill(null);
        this.ctx = ctx;
        this.size = size;
        this.pxSize = ctx.canvas.width;
        this.rule = this.pxSize / (this.size + 1);
        this.bg = "#fad6a5";
        this.fg = "#724506";
    }
    resize(size) {
        this.size = size;
        this.pxSize = this.ctx.canvas.width;
        this.rule = this.pxSize / (this.size + 1);
        this.draw();
        this.state.forEach((player, i) => {
            if (player !== null) {
                console.log(i);
                let y = Math.floor(i / this.size) + 1;
                let x = i % this.size + 1;
                this.drawStone(player, new Point(x, y));
            }
        });
    }
    pxCoord(px, py) {
        return new Point(Math.round(px / this.rule), Math.round(py / this.rule));
    }
    draw() {
        this.ctx.fillStyle = this.bg;
        this.ctx.fillRect(0, 0, this.pxSize, this.pxSize);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.fg;
        for (let i = 1; i < this.size + 1; i++) {
            let pos = i * this.rule;
            let begin = this.rule;
            let end = this.pxSize - this.rule;
            this.ctx.beginPath();
            this.ctx.moveTo(begin, pos);
            this.ctx.lineTo(end, pos);
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.beginPath();
            this.ctx.moveTo(pos, begin);
            this.ctx.lineTo(pos, end);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        // do center for < 13
        if (this.size >= 13 && this.size % 2 === 1) {
            for (let i = 4; i < this.size; i += 6) {
                for (let j = 4; j < this.size; j += 6) {
                    this.drawMarker(new Point(i, j));
                }
            }
        }
    }
    drawMarker(p) {
        this.ctx.fillStyle = this.fg;
        let dotRad = this.pxSize / 150;
        this.ctx.beginPath();
        this.ctx.arc(p.x * this.rule, p.y * this.rule, dotRad, 2 * Math.PI, 0);
        this.ctx.fill();
        this.ctx.closePath();
    }
    drawStone(player, p) {
        this.ctx.fillStyle = (player === Player.B) ? "#000000" : "#ffffff";
        this.ctx.beginPath();
        this.ctx.arc(p.x * this.rule, p.y * this.rule, this.rule / 2 - 1, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();
    }
    eraseStone(p) {
        let cx = p.x * this.rule;
        let cy = p.y * this.rule;
        let half = this.rule / 2;
        let bx = cx - half;
        let by = cy - half;
        this.ctx.fillStyle = this.bg;
        this.ctx.fillRect(bx, by, this.rule, this.rule);
        this.ctx.strokeStyle = this.fg;
        this.ctx.beginPath();
        if (p.x === 1) {
            this.ctx.moveTo(cx, cy);
            this.ctx.lineTo(cx + half, cy);
        }
        else if (p.x === this.size) {
            this.ctx.moveTo(bx, cy);
            this.ctx.lineTo(bx + half, cy);
        }
        else {
            this.ctx.moveTo(bx, cy);
            this.ctx.lineTo(bx + this.rule, cy);
        }
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.beginPath();
        if (p.y == 1) {
            this.ctx.moveTo(cx, cy);
            this.ctx.lineTo(cx, cy + half);
        }
        else if (p.y == this.size) {
            this.ctx.moveTo(cx, by);
            this.ctx.lineTo(cx, by + half);
        }
        else {
            this.ctx.moveTo(cx, by);
            this.ctx.lineTo(cx, by + this.rule);
        }
        this.ctx.stroke();
        this.ctx.closePath();
        if ((p.x - 4) % 6 === 0 && (p.y - 4) % 6 === 0) {
            this.drawMarker(p);
        }
    }
    get(p) {
        if (p.x < 1 || p.x > this.size) {
            return undefined;
        }
        else if (p.y < 1 || p.y > this.size) {
            return undefined;
        }
        return this.state[(p.y - 1) * this.size + (p.x - 1)];
    }
    set(p, val) {
        if (p.x < 1 || p.x > this.size) {
            return undefined;
        }
        else if (p.y < 1 || p.y > this.size) {
            return undefined;
        }
        return this.state[(p.y - 1) * this.size + (p.x - 1)] = val;
    }
    noLibs(p) {
        let stack = [p];
        let player = this.get(p);
        let visited = new Array(this.size * this.size);
        let conn = [];
        while (stack.length > 0) {
            let curr = stack.pop();
            let i = (curr.y - 1) * this.size + (curr.x - 1);
            if (visited[i]) {
                continue;
            }
            visited[i] = true;
            conn.push(curr);
            // north
            if (curr.y > 1) {
                let np = new Point(curr.x, curr.y - 1);
                let pv = this.get(np);
                if (pv === null) {
                    return [];
                }
                else if (pv === player) {
                    stack.push(np);
                }
            }
            // west
            if (curr.x > 1) {
                let np = new Point(curr.x - 1, curr.y);
                let pv = this.get(np);
                if (pv === null) {
                    return [];
                }
                else if (pv === player) {
                    stack.push(np);
                }
            }
            // south
            if (curr.y < this.size) {
                let np = new Point(curr.x, curr.y + 1);
                let pv = this.get(np);
                if (pv === null) {
                    return [];
                }
                else if (pv === player) {
                    stack.push(np);
                }
            }
            // east
            if (curr.x < this.size) {
                let np = new Point(curr.x + 1, curr.y);
                let pv = this.get(np);
                if (pv === null) {
                    return [];
                }
                else if (pv === player) {
                    stack.push(np);
                }
            }
        }
        return conn;
    }
    capture(p) {
        let player = this.get(p);
        let res = [];
        // north
        if (p.y > 1) {
            let np = new Point(p.x, p.y - 1);
            let pv = this.get(np);
            if (pv !== null && pv != player) {
                res.push(np);
            }
        }
        // west
        if (p.x > 1) {
            let np = new Point(p.x - 1, p.y);
            let pv = this.get(np);
            if (pv !== null && pv != player) {
                res.push(np);
            }
        }
        // south
        if (p.y < this.size) {
            let np = new Point(p.x, p.y + 1);
            let pv = this.get(np);
            if (pv !== null && pv != player) {
                res.push(np);
            }
        }
        // east
        if (p.x < this.size) {
            let np = new Point(p.x + 1, p.y);
            let pv = this.get(np);
            if (pv !== null && pv != player) {
                res.push(np);
            }
        }
        res = res.map(x => this.noLibs(x));
        return res.reduce((acc, curr) => acc.concat(curr), []);
    }
}
class Game {
    constructor(size, ctx) {
        this.mode = Mode.PLAY;
        this.editMode = Edit.ADD;
        this.turn = Player.B;
        this.board = new Board(size, ctx);
        this.captured = {};
        this.captured[Player.B] = 0;
        this.captured[Player.W] = 0;
        this.undoSt = [];
        this.redoSt = [];
        this.controls = new Controls();
    }
    nextTurn() {
        this.turn = (this.turn === Player.B) ? Player.W : Player.B;
        this.controls.setDisplay(this.turn);
    }
    redo() {
        if (this.redoSt.length == 0) {
            return;
        }
        let mv = this.redoSt.pop();
        this.board.set(mv.p, mv.player);
        this.board.drawStone(mv.player, mv.p);
        mv.captured.forEach(cp => {
            this.board.set(cp, null);
            this.board.eraseStone(cp);
            this.captured[mv.player]++;
        });
        this.controls.updateCaptured(mv.player, this.captured[mv.player]);
        this.undoSt.push(mv);
        this.controls.enableButton(Btn.UNDO);
        if (this.redoSt.length === 0) {
            this.controls.disableButton(Btn.REDO);
        }
        this.nextTurn();
    }
    undo() {
        if (this.undoSt.length == 0) {
            return;
        }
        let mv = this.undoSt.pop();
        this.board.set(mv.p, null);
        this.board.eraseStone(mv.p);
        let enemy = (mv.player === Player.B) ? Player.W : Player.B;
        mv.captured.forEach(cp => {
            this.board.set(cp, enemy);
            this.board.drawStone(enemy, cp);
            this.captured[mv.player]--;
        });
        this.controls.updateCaptured(mv.player, this.captured[mv.player]);
        this.redoSt.push(mv);
        this.controls.enableButton(Btn.REDO);
        if (this.undoSt.length === 0) {
            this.controls.disableButton(Btn.UNDO);
        }
        this.nextTurn();
    }
    clearHist() {
        this.undoSt = [];
        this.redoSt = [];
        this.controls.disableButton(Btn.UNDO);
        this.controls.disableButton(Btn.REDO);
    }
}

class Controls {
    constructor() {}
    enableButton(btn) {
        document.getElementById(btn).classList.replace("off", "on");
        document.getElementById(btn).classList.add("push");
    }
    disableButton(btn) {
        document.getElementById(btn).classList.replace("on", "off");
        document.getElementById(btn).classList.remove("push");
    }
    setDisplay(player, editp = false) {
        let pname = (player === Player.B) ? "Black" : "White";
        let disp = document.getElementById("display");
        if (editp) {
            disp.innerHTML = "Editing " + pname;
        } else {
            disp.innerHTML = pname + " to play";
        }
    }
    setMode(mode, player) {
        console.log(player);
        let mb = document.getElementById(Btn.MODE);
        if (mode === Mode.EDIT) {
            mb.innerHTML = "mode — EDIT"
            mb.classList.replace("green3d", "red3d");
            let es = document.getElementsByClassName("edit");
            for (let i = 0; i < es.length; i++) {
                es[i].style.display = "flex";
            }
            let ps = document.getElementsByClassName("play");
            for (let i = 0; i < ps.length; i++) {
                ps[i].style.display = "none";
            }
            this.setDisplay(player, true);
        } else {
            mb.innerHTML = "mode — PLAY"
            mb.classList.replace("red3d", "green3d");
            let es = document.getElementsByClassName("edit");
            for (let i = 0; i < es.length; i++) {
                es[i].style.display = "none";
            }
            let ps = document.getElementsByClassName("play");
            for (let i = 0; i < ps.length; i++) {
                ps[i].style.display = "flex";
            }
            this.setDisplay(player);
        }
    }
    setEditMode(mode) {
        document.getElementById(Btn.ADDP).innerHTML =
            (mode === Edit.ADD) ? "Add Stones" : "Remove Stones";
    }
    updateCaptured(player, n) {
        let capId = ""
        let btnId = "";
        if (player === Player.B) {
            capId = "capb"
            btnId = Btn.BM;
        } else {
            capId = "capw"
            btnId = Btn.WM;
        }
        document.getElementById(capId).innerHTML = n;
        (n === 0) ? this.disableButton(btnId) : this.enableButton(btnId);
    }
}

function goban(canvas) {
    let ctx = canvas.getContext("2d");
    let gameSize = 19;

    function resizeCanvas() {
        if (window.innerWidth > window.innerHeight) {
            ctx.canvas.width = window.innerHeight;
            ctx.canvas.height = window.innerHeight;
        } else {
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerWidth;
        }
        game.board.resize(gameSize);
    }

    let game = new Game(gameSize, ctx);
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, false);

    document.getElementById("display").addEventListener("click", ev => {
        if (game.mode == Mode.EDIT) {
            if (game.turn === Player.B) {
                game.turn = Player.W;
            } else {
                game.turn = Player.B;
            }
            game.controls.setDisplay(game.turn, true);
        }
    });
    document.getElementById(Btn.BP).addEventListener("click", ev => {
        game.controls.updateCaptured(Player.B, ++game.captured[Player.B]);
    });
    document.getElementById(Btn.BM).addEventListener("click", ev => {
        if (game.captured[Player.B] > 0) {
            game.controls.updateCaptured(Player.B, --game.captured[Player.B]);
        }
    });
    document.getElementById(Btn.WP).addEventListener("click", ev => {
        game.controls.updateCaptured(Player.W, ++game.captured[Player.W]);
    });
    document.getElementById(Btn.WM).addEventListener("click", ev => {
        if (game.captured[Player.W] > 0) {
            game.controls.updateCaptured(Player.W, --game.captured[Player.W]);
        }
    });
    document.getElementById(Btn.UNDO).addEventListener("click", ev => {
        game.undo();
    });
    document.getElementById(Btn.REDO).addEventListener("click", ev => {
        game.redo();
    });
    document.getElementById(Btn.MODE).addEventListener("click", ev => {
        if (game.mode === Mode.PLAY) {
            game.mode = Mode.EDIT;
            game.controls.setMode(Mode.EDIT, game.turn);
        } else {
            game.mode = Mode.PLAY;
            game.controls.setMode(Mode.PLAY, game.turn);
        }
    })
    document.getElementById(Btn.ADDP).addEventListener("click", ev => {
        game.editMode = (game.editMode === Edit.ADD) ? Edit.SUB : Edit.ADD;
        game.controls.setEditMode(game.editMode);
    });

    canvas.addEventListener("click", ev => {
        let p = game.board.pxCoord(ev.offsetX, ev.offsetY);
        if (game.mode === Mode.PLAY) {
            if (game.board.get(p) === null) {
                game.board.set(p, game.turn);
                let captured = game.board.capture(p);
                if (captured.length === 0 && game.board.noLibs(p).length !== 0) {
                    game.board.set(p, null);
                    return;
                }
                //ko rule
                if (
                    captured.length === 1 && game.undoSt.length > 0 &&
                    game.undoSt[game.undoSt.length-1].captured.length === 1
                ) {
                    let lm = game.undoSt[game.undoSt.length-1];
                    let lcp = lm.captured[0];
                    let cp = captured[0];
                    if (
                        p.x === lcp.x && p.y === lcp.y && 
                        cp.x === lm.p.x && cp.y === lm.p.y
                    ) {
                        game.board.set(p, null);
                        return;
                    }
                }
                game.redoSt.push({player: game.turn, p: p, captured: captured});
                game.redo();
            }
        } else if (game.mode == Mode.EDIT) {
            if (game.editMode === Edit.ADD) {
                game.board.set(p, game.turn);
                game.board.drawStone(game.turn, p);
            } else {
                game.board.set(p, null);
                game.board.eraseStone(p);
            }
            game.clearHist();
        }
    });
}

window.addEventListener("load", ev => {
    let canvas = document.getElementById("goban");
    goban(canvas);
});