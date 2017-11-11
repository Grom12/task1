//объявляем переменные
var base = 60;
var clocktimer,dateObj,dh,dm,ds,ms;
var readout = '';
var h = 1,m = 1,tm = 1,s = 0,ts = 0,ms = 0,init = 0;
//функция для очистки поля
function ClearСlock() {
    clearTimeout(clocktimer);
    h = 1;m = 1;tm = 1;s = 0;ts = 0;ms = 0;
    init = 0;
    readout = '00:00:00.00';
    document.MyForm.stopwatch.value =readout;
}

function StartTIME() {
    var cdateObj = new Date();
    var t = (cdateObj.getTime() - dateObj.getTime())-(s*1000);
    if (t > 999) { s++; }
    if (s >= (m*base)) {
        ts = 0;
        m++;
    } else {
        ts = parseInt((ms/100)+s);
        if(ts >= base) { ts = ts-((m - 1)*base); }
    }
    if (m > (h*base)) {
        tm = 1;
        h++;
    } else {
        tm = parseInt((ms/100) + m);
        if(tm >= base) { tm = tm - ((h-1)*base); }
    }
    ms = Math.round(t/10);
    if (ms > 99) {ms = 0;}
    if (ms == 0) {ms = '00';}
    if (ms > 0&&ms <= 9) { ms = '0'+ms; }
    if (ts > 0) { ds = ts; if (ts<10) { ds = '0'+ts; }} else { ds = '00'; }
    dm = tm-1;
    if (dm > 0) { if (dm < 10) { dm = '0' + dm; }} else { dm = '00'; }
    dh = h-1;
    if (dh > 0) { if (dh < 10) { dh = '0'+dh; }} else { dh = '00'; }
    readout = dh + ':' + dm + ':' + ds + '.' + ms;
    document.MyForm.stopwatch.value = readout;
    clocktimer = setTimeout("StartTIME()",1);
}

function StartStop() {
    if (init==0){
        ClearСlock();
        dateObj = new Date();
        StartTIME();
        init=1;
    }
}


function Cell() {
    this.has_mine = false;
    this.alongside = 0;
    this.not_clicked = false;
}

function optionGame(row, column, mine) {
    ClearСlock();
    game.width = column;
    game.height = row;
    game.count_mine = mine;
    page.init(); //СМЕНА СЛОЖНОСТИ
}

function restart() {
    game.start_game();
    page.game_interface.create_field();
    ClearСlock();
}



var game = {
    width: 9,
    height: 9,
    count_mine: 10,
    open_count: 0,
    field:[],
    fill_mine:function () {
        this.field = [];
        for(let i = 0; i < this.width; i++) {
            let mass = [];
            for (let j = 0; j < this.height; j++) {
                mass.push(new Cell());
            }
            this.field.push(mass);
        }
        for (let i = 0; i < this.count_mine;){
            let x = parseInt(Math.random() * this.width);
            let y = parseInt(Math.random() * this.height);
                if(!(this.field[x][y].has_mine)) {
                this.field[x][y].has_mine = true;
                i++;
            }
        }
    },
    find_alongside_mine :function (x, y) {
        let x_left = x > 0 ? x - 1 : x;
        let y_left = y > 0 ? y - 1 : y;
        let x_right = x < this.width - 1 ? x + 1 : x;
        let y_right = y < this.height - 1 ? y + 1 : y;
        let count = 0;

      for (let i = x_left; i <= x_right; i++ ) {
          for(let j = y_left; j <= y_right; j++) {
              if(this.field[i][j].has_mine && !(x==i && y==j)) count ++;

          }
      }
      this.field[x][y].alongside = count;
    },
    start_main_counter : function () {
        for(let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.find_alongside_mine(i,j);
            }
        }
    },

    start_game: function () {

        this.open_count = 0;
        this.fill_mine();
        this.start_main_counter();
    }
};


var page = {
    init:function () {

        this.game_interface.init();

    },
    game_interface: {
        table:null,
        init:function () {
            table = null;
            game.start_game();
            blocks = document.querySelector(".field");
            blocks.removeEventListener("click",handler);
            this.create_field();
            var self = this;

            blocks.addEventListener("click",handler); //ПЕРВЫЙ 
            function handler(e) {
                if(e.target.matches("td")  && !(e.target.matches(".flag"))) {
                    self.click_cell(e);
                }
            };

            blocks.addEventListener("contextmenu",handler2); //ВТОРОЙ
            function handler2(e) {
                if(e.target.matches("td")) self.flag(e);
            };
            console.log(blocks);

        },
        create_field:function () {
            blocks.innerHTML = "";
            let table = document.createElement("table");
            this.table = table;
            for(let i = 0; i < game.height; i++)
            {
                let tr = document.createElement("tr");
                for (let j = 0; j < game.width; j++) {
                    let td = document.createElement("td");
                    if(game.field[j][i].has_mine) td.classList.add("bomber");
                    tr.appendChild(td);
                }
                table.appendChild(tr);
            }
            blocks.appendChild(table)
        },
        show_bombs : function () {
            let td = document.querySelectorAll(".bomber");
            for(let i = 0; i < td.length; i++)
            {
                td[i].classList.remove("bomber");
                td[i].classList.add("boom");
            }
        },
        click_cell: function (e) {

            x =  e.target.cellIndex;
            y = e.target.parentNode.rowIndex;
            this.open_near_click(x,y);

        },
        open_near_click: function (x, y) {
            let td = this.table.rows[y].children[x];
            if(game.field[x][y].not_clicked) return;
            if(game.field[x][y].has_mine){
				 this.show_bombs(); //не срабптывает, сработает, если удалить алерт и 3 метода
                alert("GG")
                ClearСlock();
                game.start_game();
                this.create_field();
            }else{
                td.innerHTML = game.field[x][y].alongside;
                game.field[x][y].not_clicked = true;
                if(game.field[x][y].alongside == 0) {
                    for (let i = x > 0 ? x - 1 : x; i <= x+1 && i < game.width; i++ ) {
                        for(let j = y > 0 ? y - 1 : y; j <= y + 1 && j < game.height ; j++) {
                            this.open_near_click(i,j);
                        }
                    }
                }
                td.classList.add("clicked");
                game.open_count ++;
                if(game.width * game.height - game.count_mine == game.open_count) {
                    alert("Wiiiin");
                    ClearСlock();
                    game.start_game();
                    this.create_field();
                }
            }
        },
        flag : function (e) {
            x =  e.target.cellIndex;
            y = e.target.parentNode.rowIndex;
            if(game.field[x][y].not_clicked) return;
            e.target.classList.toggle("flag");
            e.preventDefault();

        },
    }
};



