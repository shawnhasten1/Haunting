var upper_tiles = [];
var ground_tiles = [];
var basement_tiles = [];

var class_ground_tiles = [];

$(document).ready(function(){
    $.get("/api/v1/get_tiles", function(data){
        upper_tiles = data['upper_tiles'];
        ground_tiles = data['ground_tiles'];
        directions_list.push([10000, 10000]);
        ground_tiles.unshift({
            'name':'landing',
            'img':'tile_02.jpg',
            'directions':[
                'left',
                'up',
                'right',
                'down'
            ]
        })
        console.log(JSON.stringify(ground_tiles));
        var new_tile = ground_tiles[0];
        var index = ground_tiles.indexOf(new_tile);
        ground_tiles.splice(index, 1);
        ground_tile(10000,10000,new_tile);
        
        $('html, body').animate({
            scrollTop: 10000,
            scrollLeft: 10000
        }, 0);
        basement_tiles = data['basement_tiles'];
    });
});


var ground_holder = document.getElementById("ground_floor");
var directions_list = [];
var global_index = 0;
function ground_tile(posX = 0, posY = 0, objDetails){
    this.posX = posX;
    this.posY = posY;
    this.image = objDetails['img'];
    this.name = objDetails['name'];
    this.full_obj = objDetails;

    this.tile_elem = document.createElement("img");
    this.tile_elem.src = '/static/img/tiles/'+String(objDetails['img']).substring(0, String(objDetails['img']).length-4) +'.gif';
    this.tile_elem.style.position = 'absolute';
    this.tile_elem.style.left = posX+'px';
    this.tile_elem.style.top = posY+'px';
    this.tile_elem.setAttribute('directions', String(objDetails['directions']));
    this.tile_elem.setAttribute('index', global_index);
    var this_index = global_index;
    global_index+=1;
    ground_holder.appendChild(this.tile_elem);
    var found = false;
    var random_directions = [];
    for(var i = 0; i<10000; i++){
        var direction_index = getRandomInt(0, objDetails['directions'].length);
        var direction = objDetails['directions'][direction_index];
        if(direction === undefined){
            direction = objDetails['directions'][direction_index-1];
        }
        for(var j = 0; j<ground_tiles.length; j++){
            var new_direction = '';
            var new_posX = posX;
            var new_posY = posY;
            if(direction == 'left'){
                this.tile_elem.setAttribute('flow', 'Is Left Find Right');
                new_direction = 'right';
                new_posX = posX - 512;
                new_posY = posY;
            }
            else if(direction == 'up'){
                this.tile_elem.setAttribute('flow', 'Is Up Find Down');
                new_direction = 'down';
                new_posX = posX;
                new_posY = posY - 512;
            }
            else if(direction == 'right'){
                this.tile_elem.setAttribute('flow', 'Is Right Find Left');
                new_direction = 'left';
                new_posX = posX + 512;
                new_posY = posY;
            }
            else if(direction == 'down'){
                this.tile_elem.setAttribute('flow', 'Is Down Find Up');
                new_direction = 'up';
                new_posX = posX;
                new_posY = posY + 512;
            }
            this.tile_elem.setAttribute('curr_direction', direction);
            this.tile_elem.setAttribute('new_direction', new_direction);
            var valid = true;
            for(var x = 0; x<directions_list.length; x++){
                if(directions_list[x][0] == new_posX && directions_list[x][1] == new_posY){
                    valid = false;
                }
            }
            if(valid){
                if(ground_tiles[j]['directions'].indexOf(new_direction) != -1){
                    directions_list.push([new_posX, new_posY]);
                    var curr_tile = ground_tiles[j];
                    var index = ground_tiles.indexOf(curr_tile);
                    ground_tiles.splice(index, 1);
                    ground_tile(new_posX,new_posY,curr_tile);
                    found = true;
                }
            }
        }
    }
    if(found == false){
        console.error('NOT FOUND');
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}