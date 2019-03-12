$(document).keydown(function(e){
    switch(e.which){
        case 39 : //right key
            handle.setRight();
            break;
        case 37 : //left key
            handle.setLeft();
            break;
        case 40 : //down key
            handle.setDown();
            break;
        case 38 : //up key
            handle.rotate();
            break;
        case 32 : //space key
            handle.drop();
            break;
    }
});

$(document).ready(function(){
    for(var i=0; i < 20; i++){
        for(var j=0; j < 10; j++){
            $("<div>").addClass("block none").appendTo("#stage");
        }
    }

    handle.init();
    interval = setInterval(function(){
        handle.setDown();
    }, handle.speed);
});

var handle = {
    "type" : "none",
    "top" : 0,
    "left" : 0,
    "width" : 0,
    "height" : 0,
    "rotation" : 0,
    "speed" : 1000,
    "init" : function(){
        this.top = 0;
        this.left = 0;
        this.width = 0;
        this.height = 0;
        this.rotation = 0;
        this.setType("type"+(Math.floor(Math.random()*100)%18 + 1));
        this.setTop();
        this.rotate(0);

        this.move();
    },
    "setType" : function(typeName){
        this.type = types[typeName];
        var width = this.width = this.type.width;
        var height = this.height = this.type.height;

        // 테트로미노가 생성될 영역을 초기화하고 너비와 높이를 세팅한다.
        $("#handle").empty().width(width * 25)
                    .height(height * 25);

        for(var i=0; i < height; i++){
            for(var j=0; j < width; j++){
                // 1과 0으로 이루어진 shape 배열에서 1인 경우 해당 타입의 색상을 지정한다.
                if(this.type.shape[i][j]){
                    $("<div>").addClass("block").addClass(typeName).appendTo("#handle");
                }
                // 0인 경우 빈 곳으로 채운다.
                else {
                    $("<div>").addClass("block").addClass("whiteLine").appendTo("#handle");
                }
            }
        }
    },
    "move" : function(){
        $("#handle").animate({"top":this.top*25, "left":this.left*25}, 50);

        this.clearLine();
    },
    "setTop" : function(){
        this.left = 4;
        this.top = 0;
        this.rotation = 0;
        $("#handle").css({"top":this.top*25, "left":this.left*25});

        if(this.checkCollision()){
            clearInterval(interval);
            alert("Game Over!");
        }
    },
    "setRight" : function(){
        this.left+=1;
        if(this.checkCollision()){
            this.left-=1;
        };
        this.move();
    },
    "setLeft" : function(){
        this.left-=1;
        if(this.checkCollision()){
            this.left+=1;
        };
        this.move();
    },
    "setDown" : function(){
        this.top+=1;
        if(this.checkCollision()){
            this.top-=1;
            this.fillBlock();
            this.init();
        };

        this.move();
    },
    "rotate" : function(rotation){
        if(rotation != 0){
            this.rotation++;
            rotation = this.rotation %= this.type.maxRotation;
        }
        if(this.checkCollision()){
            this.rotation--;
            this.rotation %= this.type.maxRotation;
        }
        else {
            $("#handle").css("transform", "rotate("+ rotation*90 +"deg)");
        }
        this.move();
    },
    "clearLine" : function(){
        var blocks = $("#stage > .block");
        var count = 0;
        for(var i=0; i < 20; i++){
            for(var j=0; j < 10; j++){
                if(blocks.eq(i*10 + j).hasClass("none")){
                    break;
                }
                count++;
            }
            if(count == 10){
                for(var k=0; k < 10; k++){
                    blocks.eq(i*10 + k).remove();
                    $("<div>").addClass("block none").prependTo("#stage");
                }
            }
            count = 0;
        }
    },
    "rotateCoord" : function(i, j){
        var x,y;
        switch(this.rotation%4) {
            case 0:
                x=i;
                y=j;
                break;
            case 1:
                x=j;
                y=this.width-i-1;
                break;
            case 2:
                x=this.height-i-1;
                y=this.width-j-1;
                break;
            case 3:
                x=this.width-j-1;
                y=i;
                break;
            default:
                x=i;
                y=j;
        }
        return {"x":x, "y":y};
    },
    "checkCollision" : function(){
        var left = this.left;
        var top = this.top;

        var width = this.width;
        var height = this.height;

        for(var i=0; i < height; i++){
            for(var j=0; j < width; j++){
                var x,y;
                var coord = this.rotateCoord(i,j);
                x = coord.x;
                y = coord.y;

                if(this.type.shape[i][j] == 1){
                    //벽에 닿은 경우
                    if(top + x > 19) {
                        return true;
                    }
                    else if(left + y < 0) {
                        return true;
                    }
                    else if(left + y > 9) {
                        return true;
                    }

                    //다른 블록에 닿은 경우
                    if(!$("#stage > .block").eq((this.top+x)*10 + this.left+y).hasClass("none")){
                        return true;
                    }
                }
            }
        }
        return false;
    },
    "fillBlock" : function(){
        var width = this.width;
        var height = this.height;
        for(var i=0; i < height; i++){
            for(var j=0; j < width; j++){
                var x,y;
                var coord = this.rotateCoord(i,j);
                x = coord.x;
                y = coord.y;

                if(this.type.shape[i][j] == 1){
                    $("#stage > .block").eq((this.top+x)*10 + this.left+y).removeClass("none").addClass(this.type.name);
                }
            }
        }
    },
    "drop" : function(){
        while(!this.checkCollision()){
            this.top++;
        }
        this.top--;
        this.fillBlock();
        this.init();
        this.move();
    },
};
