var player_details = {
    "position":'1024px'
}
var game_details = new Vue({
    el: '#ground_floor',
    data: {
        "ground_tiles":[
            {
                "positionX":1536,
                "positionY":512,
                "directions": [
                    "down"
                ], 
                "floor": [
                    "ground"
                ], 
                "name": "Grand Staircase", 
                "special": {
                    "status": "move", 
                    "tile": "tile_03.jpg"
                }, 
                "type": null
            },
            {
                "positionX":1536,
                "positionY":1024,
                "directions": [
                    "left", 
                    "up", 
                    "right",
                    "down"
                ], 
                "floor": [
                    "ground"
                ], 
                "name": "Foyer", 
                "special": {}, 
                "type": null
            },
            {
                "positionX":1536,
                "positionY":1536,
                "directions": [
                    "left", 
                    "up", 
                    "right",
                    "down"
                ], 
                "floor": [
                    "ground"
                ], 
                "name": "Entrance Hall", 
                "special": {}, 
                "type": null
            }
        ],
        "available_ground_tiles":[]
    }
});

var player_controller = new Vue({
    el: '#players',
    data: {
      players: [
        {
            "positionX":1536,
            "positionY":1024,
            "floor":"ground"
        }
      ]
    }
})

$('html, body').animate({
    scrollTop: player_controller.players[0]['positionY'],
    scrollLeft: player_controller.players[0]['positionX']
}, 0);
$(document).ready(function(){
    $.get("/api/v1/get_tiles", function(data){
        game_details['available_ground_tiles'] = data['ground_tiles'];
    });
    for(var x = 0; x<20000; x+=512){
        for(var y = 0; y<20000; y+=512){
            var debugHTML = "<div class='debug-tile' style='left:"+String(x)+"px; top:"+String(y)+"px'><h1>"+String(x)+"X"+String(y)+"</h1></div>";
            document.getElementById("debug").innerHTML += debugHTML;
        }
    }
    $("body").keypress(function(e){
        var code = e.keyCode || e.which;
        var newX = player_controller.players[0]['positionX'];
        var newY = player_controller.players[0]['positionY'];
        var position_obj = {
            "positionX":newX,
            "positionY":newY
        }
        var curr_tile = getCurrentTile(position_obj);
        console.log(curr_tile);
        var desired_direction = '';
        if(code == 119) {
            newY-=512;
            desired_direction = 'up';
        }
        else if(code == 115) {
            newY+=512;
            desired_direction = 'down';
        }
        else if(code == 97) {
            newX-=512;
            desired_direction = 'left';
        }
        else if(code == 100) {
            newX+=512;
            desired_direction = 'right';
        }
        var good_move = false;
        position_obj = {
            "positionX":newX,
            "positionY":newY
        }
        if(curr_tile.directions.indexOf(desired_direction) != -1){
            var new_tile = getCurrentTile(position_obj);
            var need_direction = '';
            if(desired_direction == 'left'){
                need_direction='right';
            }
            else if(desired_direction == 'up'){
                need_direction='down';
            }
            else if(desired_direction == 'right'){
                need_direction='left';
            }
            else if(desired_direction == 'down'){
                need_direction='up';
            }
            if(new_tile){
                console.log(need_direction);
                console.log(new_tile);
                if(new_tile['directions'].indexOf(need_direction) != -1){
                    player_controller.players[0]['positionX'] = newX;
                    player_controller.players[0]['positionY'] = newY;
                }
                else{
                    console.log('Invalid move 2');
                }
            }
            else{
                console.log('Need to generate tile');
                var generated_tile = null;
                generated_tile = generateTile(need_direction);
                if(generated_tile){
                    var index = game_details['available_ground_tiles'].indexOf(generated_tile);
                    console.log(index);
                    game_details['available_ground_tiles'].splice(index, 1);
                    generated_tile['positionX'] = newX
                    generated_tile['positionY'] = newY
                    game_details['ground_tiles'].push(generated_tile);
                    console.log(generated_tile);
                    player_controller.players[0]['positionX'] = newX;
                    player_controller.players[0]['positionY'] = newY;
                }
            }
        }
        else{
            console.log('Invalid move');
        }
        $('html, body').animate({
            scrollTop: player_controller.players[0]['positionY']/2,
            scrollLeft: player_controller.players[0]['positionX']/2
        }, 0);
    })
});

function isTileThere(obj, list, desired_direction){
    for(var i = 0; i<list.length; i++){
        if(list[i]['positionX'] == obj['positionX'] && list[i]['positionY'] == obj['positionY']){
            return list[i];
        }
    }
    return null;
}
function getCurrentTile(position){
    for(var i = 0; i<game_details['ground_tiles'].length; i++){
        if(game_details['ground_tiles'][i]['positionX'] == position['positionX'] && game_details['ground_tiles'][i]['positionY'] == position['positionY']){
            return game_details['ground_tiles'][i];
        }
    }
    return null;
}
function generateTile(needed_direction, floor='ground'){
    var tiles = game_details['available_ground_tiles'];
    for(var i = 0; i<tiles.length; i++){
        if(tiles[i]['directions'].indexOf(needed_direction) != -1){
            return tiles[i];
        }
    }
}