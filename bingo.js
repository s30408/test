var BingoModel = function(number) {
  // 모델이 가지는 속성과 값을 지정한다.
  var attributes = {
    number: number,
    selected: false
  };
  
  // 모델의 getter 함수
  this.get = function(attr) {
    if(attributes[attr]) {
      return attributes[attr];
    }
    else {
      return null;
    }
  };
  
  // 모델의 setter 함수
  this.set = function(attr, value) {
    attributes[attr] = value;
    
    // 데이터가 변경된 경우 이벤트를 발생시켜서
    // Collection이나 View에 알릴 수 있도록 한다.
    $(this).trigger("change", {number: this.get("number")});
  };
  
  // 칸을 선택하는 경우 select 함수를 호출하자.
  this.select = function() {
    // 선택되지 않은 칸만 선택가능.
    if(!this.get("selected")){
      this.set("selected", true);      
    }
  };
};

var BingoCollection = function() {
  this.models = [];
  var bingo_lines;
  
  this.init = function() {
    var numbers = [],
        self = this,
        bingo_lines = 0;
    
    // 25개의 숫자를 추가한다.
    for (var i=1; i<=25; i++) {
      numbers.push(i);
    }
    
    // 25개의 숫자를 무작위로 섞는다.
    numbers = getRandomSet(numbers);
    
    // Model 객체를 생성하여 model list에 추가한다.
    for(var i=0, length=numbers.length; i < length; i++){
      this.models.push(new BingoModel(numbers[i]));
      
      $(this.models[i]).on("change", function(e, data){
        var bingo = checkBingo.call(self);
        if(bingo_lines != bingo) {
          bingo_lines = bingo;
          $(self).trigger("bingo", {bingo_lines:bingo});
        }
        $(self).trigger("update", data);
      });
    }
  };
  
  var checkBingo = function() {
    var bingo = 0;
    for(var i=0; i < 5; i++) {
      // 가로라인 체크
      if(this.models[i*5].get("selected")
        && this.models[i*5 + 1].get("selected")
        && this.models[i*5 + 2].get("selected")
        && this.models[i*5 + 3].get("selected")
        && this.models[i*5 + 4].get("selected")) {
          bingo++;
      }
      
      // 세로라인 체크
      if(this.models[i].get("selected")
        && this.models[1*5 + i].get("selected")
        && this.models[2*5 + i].get("selected")
        && this.models[3*5 + i].get("selected")
        && this.models[4*5 + i].get("selected")) {
          bingo++;
      }
    }
    
    // 대각선라인 체크
    if(this.models[0].get("selected")
      && this.models[6].get("selected")
      && this.models[12].get("selected")
      && this.models[18].get("selected")
      && this.models[24].get("selected")) {
        bingo++;
    }
    if(this.models[4].get("selected")
      && this.models[8].get("selected")
      && this.models[12].get("selected")
      && this.models[16].get("selected")
      && this.models[20].get("selected")) {
        bingo++;
    }
    return bingo;
  };
  
  // private getRandomSet()
  // 랜덤한 데이터세트를 생성한다.
  var getRandomSet = function(numberSet) {
    numberSet.sort(function (a, b) {
      var temp = parseInt(Math.random() * 10);
      var isOddOrEven = temp % 2;
      var isPosOrNeg = temp > 5 ? 1 : -1;
      return (isOddOrEven*isPosOrNeg);
    });
    return numberSet;
  };
  
  // 상대방이 선택한 숫자가 있는 모델을 찾아서 선택된 상태로 변경한다.
  this.sync = function(number) {
    for(var i=0, length = this.models.length; i < length; i++){
      if(this.models[i].get("number") == number) {
        this.models[i].select();
        return ;
      }
    }
  }
};

var BingoView = function(player) {
  var el = $(player),
      collection = null,
      myturn = false;
  
  // public init()
  // 초기화 함수
  this.init = function() {
    collection = new BingoCollection(el);
    collection.init();
    
    // 화면에 표시한다.
    this.render();
    
    // 클릭이벤트 핸들러를 등록한다.
    el.find("td").on("click", onClick);
    
    // 컬렉션의 업데이트가 발생하면 렌더링을 다시한다.
    $(collection).on("update bingo", this.render);
  };
  
  var onClick = function(event) {
    if(myturn){
      var model_id = $(this).attr("model");
      collection.models[model_id].select();
    }
  };
  
  // public render()
  // 데이터를 화면에 표현하는 함수
  this.render = function(e, data) {
    // 각 셀에 숫자를 표시한다.
    el.find("td").each(function(i){
      $(this).attr("model", i).text(collection.models[i].get("number"));
      
      if(collection.models[i].get("selected")){
        $(this).addClass("selected");
      }
      else {
        $(this).removeClass("selected");
      }
    });
    
    // 빙고
    if(e && e.type == "bingo") {
      if(data.bingo_lines >= 3){
        el.find(".bingo_lines").text("Win!!");
        el.find("caption").css("color", "red");
      }
      else {
        el.find(".bingo_lines").text("(" + data.bingo_lines + " bingo)"); 
      }
    }
    // 칸 체크시 이벤트 발생
    else if(e && e.type == "update") {
      $(document).trigger("checked", data);
      myturn = false;
      el.css("border-color", "black");
    }
  };
  
  this.setTurn = function(){
    el.css("border-color", "red");
    myturn = true;
  };
  
  this.sync = function(number){
    collection.sync(number);
  };
};

$(function() {
  var player1 = new BingoView("#player1");
  player1.init();
  
  var player2 = new BingoView("#player2");
  player2.init();
  
  var turn = "player1";
  player1.setTurn();
  
  $(document).on("checked", function(e, data) {
    if(turn == "player1") {
      player2.sync(data.number);
      turn = "player2";
      player2.setTurn();
    }
    else if(turn == "player2") {
      player1.sync(data.number);
      turn = "player1";
      player1.setTurn();
    }
  });
});
