const indexField = new Map()
const winLine = 2
const events = {
    newField(event) {
        let target = event.parentNode.parentNode
        let field = new Field("div")
        field.element.setAttribute("class", "field")
        field.addPanel()
        field.addTable(5, 5)
        target.insertAdjacentElement('afterEnd', field.element)
    },
    inBut(event) {
        let field = event.parentNode.parentNode.parentNode
        // удаляем тэг table
        Field.removeTable(field)
        let form = event.parentNode
        let input = form.querySelectorAll("input")
        let but1 = input[0].value
        let but2 = input[1].value
        let elem = new Field("div")
        elem.addTable(but1, but2)
        field.appendChild(elem.element.firstChild)
    },
    sizeBut(event) {
        let field = event.parentNode.parentNode.parentNode
        Field.removeTable(field)
        let table = new Field("div")
        table.addTable(event.value, event.value)
        field.appendChild(table.element.firstChild)
    },
    start(event) {
        let field = event.parentNode.parentNode.parentNode
        let table = field.querySelector("tr").parentNode
        table.onclick = this.everyClick
        let id = "f" + indexField.size
        table.setAttribute("id", id)
        indexField.set(id, new Map())
    },
    everyClick(event) {
        let target = event.target; // где был клик?
        // let td = target.closest('td') // проверка родича
        if (target.tagName != 'TD') return;
        // находим число строк и клеток
        let rows = event.srcElement.parentNode.parentNode.rows.length
        let cols = event.srcElement.parentNode.children.length
        // определяем таблицу
        let table = event.srcElement.parentNode.parentNode
        let index = indexField.get(table.id)
        let str = Field.getId(event)
        if (index.has(str)) console.log("Ключ уже есть")
        let player = Player.lastPlayer(index)
        player == "X" ? player = "O" : player = "X"
        index.set(str, player)
        target.innerText = player
        let step = new Game(str, rows, cols)
        step.sumSteps(player, index)
        step.crosSteps("left", "right")
        step.crosSteps("up", "down")
        step.crosSteps("dole", "upri")
        step.crosSteps("uple", "dori")
        step.colorWin(table)
        step.playerWin(index)
    }
}

class Field {
    constructor(val) {
        this.element = document.createElement(val)
    }
    static removeTable(parent) {
        let child = parent.querySelector("table")
        parent.removeChild(child)
    }
    static getId(event) {
        let tdcol = event.srcElement.parentElement.getElementsByTagName(event.target.tagName)
        let trcol = event.srcElement.parentElement.parentElement.getElementsByTagName(event.srcElement.parentElement.tagName)
        let nrow = Array.from(tdcol).findIndex(item => item == event.srcElement)
        let ncol = Array.from(trcol).findIndex(item => item == event.srcElement.parentElement)
        return ncol.toString() + nrow.toString()
    }
    static getElt(id, str) {
        let table = document.getElementById(id)
        let row = str.charAt(0)
        let col = str.charAt(1)
        return table.children[row].children[col]
    }
    addPanel() {
        let panel = document.querySelector(".panel")
        let clone = panel.cloneNode(true)
        this.element.appendChild(clone)
    }
    addlastChild(val) {
        let child = document.createElement(val)
        let last = this.element.hasChildNodes()
        last.appendChild(child)
    }
    addTable(rows, cells) {
        let table = document.createElement("table")
        for (let i = 1; i <= rows; i++) {
            let tr = document.createElement('tr');
            for (let j = 1; j <= cells; j++) {
                let td = document.createElement('td');
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        this.element.appendChild(table)
    }
}

class Game {
    constructor(str, lines, columns) {
        this.arrleft = [];
        this.arrright = [];
        this.arrup = [];
        this.arrdown = [];
        this.arrdole = [];
        this.arruple = [];
        this.arrupri = [];
        this.arrdori = [];
        this.arrleftright = [];
        this.arrupdown = [];
        this.arrdoleupri = [];
        this.arrupledori = [];
        Object.defineProperty(this, "lc", { value: str });
        this.left = Number(str.charAt(1));
        this.right = columns - Number(str.charAt(1));
        this.up = Number(str.charAt(0));
        this.down = lines - Number(str.charAt(0));
        this.dole = Math.min(this.left, this.down);
        this.uple = Math.min(this.up, this.left);
        this.upri = Math.min(this.up, this.right);
        this.dori = Math.min(this.down, this.right);
    }
    leftFn(a, b) { return a + (Number(b) - 1); };
    rightFn(a, b) { return a + (Number(b) + 1); };
    upFn(a, b) { return (Number(a) - 1) + b; };
    downFn(a, b) { return (Number(a) + 1) + b; };
    doleFn(a, b) { return (Number(a) + 1).toString() + (Number(b) - 1); };
    upleFn(a, b) { return (Number(a) - 1).toString() + (Number(b) - 1); };
    upriFn(a, b) { return (Number(a) - 1).toString() + (Number(b) + 1); };
    doriFn(a, b) { return (Number(a) + 1).toString() + (Number(b) + 1); };

    sumSteps(player, index) {
        Object.keys(this).forEach(key => {
            if (this[key] > 0) {
                let ab = this.lc
                while (this[key] > 0) {
                    let a = ab.charAt(0);
                    let b = ab.charAt(1);
                    ab = this[key + "Fn"](a, b)
                    if (index.get(ab) === player) {
                        this["arr" + key].push(ab);
                        this[key]--;
                    } else return
                }
            }
        })
    }

    crosSteps(a, b) {
        let a1 = this["arr" + a]
        let b1 = this["arr" + b]
        if (a1.length + b1.length > a1.length && a1.length + b1.length > b1.length) {
            this["arr" + a + b].push(...a1, ...b1)
            a1.length = 0
            b1.length = 0
        }
    }
    colorWin(table) {
        Object.keys(this).forEach(val => {
            if (Array.isArray(this[val]) && this[val].length >= winLine) {
                this[val].forEach(val => {
                    let td = Field.getElt(table.id, val)
                    td.setAttribute("class", "win")
                })
                let td = Field.getElt(table.id, this.lc)
                td.setAttribute("class", "win")
            }
        })
    }
    playerWin(index) {
        Object.keys(this).forEach(val => {
            if (Array.isArray(this[val]) && this[val].length >= winLine) {
                setTimeout(() => alert(`Player: ${Player.lastPlayer(index)} win`), 50)
            }
        })
    }
}

class Player {
    static lastPlayer(index) {
        return index.values().toArray()[index.size - 1]
    }
}
