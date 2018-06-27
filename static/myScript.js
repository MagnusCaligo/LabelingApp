var rectangleColor = '#0099ff';
var ws = new WebSocket("ws://66.75.229.184:80/ws")
var workingPictureID;

document.onkeypress = myKeyPress

ws.onopen = function(){
	console.log("Connected")
	ws.send("1")
}

var createRingBuffer = function(length){
  /* https://stackoverflow.com/a/4774081 */
  var pointer = 0, buffer = []; 

  return {
    get  : function(key){
        if (key < 0){
            return buffer[pointer+key];
        } else if (key === false){
            return buffer[pointer - 1];
        } else{
            return buffer[key];
        }
    },
    push : function(item){
      buffer[pointer] = item;
      pointer = (pointer + 1) % length;
      return item;
    },
    prev : function(){
        var tmp_pointer = (pointer - 1) % length;
        if (buffer[tmp_pointer]){
            pointer = tmp_pointer;
            return buffer[pointer];
        }
    },
    next : function(){
        if (buffer[pointer]){
            pointer = (pointer + 1) % length;
            return buffer[pointer];
        }
    }
  };
};


var jsonObj = {
	labels: [],
	pictureID: null,
	creditor: null
}

var topLHoleBuffer = createRingBuffer(4)
topLHoleBuffer.push("20")
topLHoleBuffer.push("21")
topLHoleBuffer.push("22")
topLHoleBuffer.push("23")

var topRHoleBuffer = createRingBuffer(4)
topRHoleBuffer.push("24")
topRHoleBuffer.push("25")
topRHoleBuffer.push("26")
topRHoleBuffer.push("27")

var fullBoardBuffer= createRingBuffer(4)
fullBoardBuffer.push("28")
fullBoardBuffer.push("29")
fullBoardBuffer.push("30")
fullBoardBuffer.push("31")

var bottomHoleBuffer = createRingBuffer(4)
bottomHoleBuffer.push("32")
bottomHoleBuffer.push("33")
bottomHoleBuffer.push("34")
bottomHoleBuffer.push("35")

var holeBuffer = createRingBuffer(4)
holeBuffer.push("11")
holeBuffer.push("12")
holeBuffer.push("13")
holeBuffer.push("14")

var gateBuffer = createRingBuffer(4)
gateBuffer.push("15")
gateBuffer.push("16")
gateBuffer.push("17")
gateBuffer.push("18")

var fruitBuffer = createRingBuffer(3)
fruitBuffer.push("8")
fruitBuffer.push("9")
fruitBuffer.push("10")

function myKeyPress(e){

    var keynum;

    if(window.event) {
        // IE                    
        keynum = e.keyCode;
    } else if(e.which){
        //            // Netscape/Firefox/Opera                   
        keynum = e.which;
    }

    //alert(String.fromCharCode(keynum));
    var s = String.fromCharCode(keynum)
    if(s.localeCompare("q") == 0){
        var option = topLHoleBuffer.next()
        document.getElementById("dropdown").selectedIndex = Number(option) - 1
    }else if(s.localeCompare("w") == 0){
        var option = topRHoleBuffer.next()
        document.getElementById("dropdown").selectedIndex = Number(option) - 1
    }else if(s.localeCompare("e") == 0){
        var option = fullBoardBuffer.next()
        document.getElementById("dropdown").selectedIndex = Number(option) - 1
    }else if(s.localeCompare("r") == 0){
        var option = bottomHoleBuffer.next()
        document.getElementById("dropdown").selectedIndex = Number(option) - 1
    }else if(["1", "2", "3", "4", "5", "6"].indexOf(s) >-1){
        document.getElementById("dropdown").selectedIndex = Number(s) - 1
    }else if(s.localeCompare("s") == 0){
        var option = holeBuffer.next()
        document.getElementById("dropdown").selectedIndex = Number(option) - 1
    }else if(s.localeCompare("f") == 0){
        var option = gateBuffer.next()
        document.getElementById("dropdown").selectedIndex = Number(option) - 1
    }else if(s.localeCompare("d") == 0){
        var option = fruitBuffer.next()
        document.getElementById("dropdown").selectedIndex = Number(option) - 1
    }
}




ws.onmessage = function (event) {
    document.getElementById('canvas').redraw()
	if("Data".localeCompare(event.data.slice(0,4)) == 0){
		var isPictureID = "ID".localeCompare(event.data.slice(5,7))
		if(isPictureID == 0){
			workingPictureID = event.data.slice(8, event.data.length)
			jsonObj["pictureID"] = workingPictureID;
		}else{
			var src = "data:image/png;base64,"
			src += event.data.slice(4, event.data.length)
			var canvas = document.getElementById("canvas")
			canvas.style.background = "url('" + src + "')"
		}
	}else if("Labels".localeCompare(event.data.slice(0,7)) == 0){
        labs = event.data.split(" ")
        console.log("Got Labels:")
        var dat = [Number(labs[1]), Number(labs[2]), Number(labs[3]), Number(labs[4]), Number(labs[5])]
        console.log(dat)
		if(isNaN(labs[1])){
			console.log("Values were NaN")
			return
		}

        if (isNaN(Number(labs[1]))){
            console.log("Values were NaN")
            return
        }
        jsonObj['labels'].push(dat);
	}else if("Leaders".localeCompare(event.data.slice(0,7)) == 0){
		//console.log("Got Leaders " + event.data.slice(8, event.data.length))
		var leaders = event.data.slice(8, event.data.length).split(" ")
		document.getElementById("rank1").innerHTML = "1. " + leaders[0]
		document.getElementById("rank2").innerHTML = "2. " + leaders[1]
		document.getElementById("rank3").innerHTML = "3. " + leaders[2]
	}else if("#Imgs".localeCompare(event.data.slice(0,5)) == 0){
        console.log("Got img number")
        var dat = event.data.split(" ")
        document.getElementById("numOfImages").innerHTML = "Number of Images Left: " + dat[1]
	}else{
		console.log("Message was " + event.data) 
	}
}

function getNewImage(){
	jsonObj["creditor"] = document.getElementById('name').value
	//console.log(JSON.stringify(jsonObj))
	//console.log(document.getElementById('name').firstElementChild.value)
	ws.send("2" + JSON.stringify(jsonObj))
	ws.send("1");
	clearJson();
	clearLabels();

}


function getPreviousImage(){
	ws.send("3" + document.getElementById("name").value);
}

function clearJson(){
	picID = jsonObj["pictureID"]
	jsonObj = {
		labels: [],
		pictureID: picID,
		creditor: null
	}
}

// Detects mouse movement on the canvas to draw the rectangles.
function initDraw(canvas) {

    function setMousePosition(e) {
        var ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            mouse.x = e.offsetX
            mouse.y = e.offsetY
        } else if (ev.clientX) { //IE
            mouse.x = ev.offsetX
            mouse.y = ev.offsetY
        }
    }
	


    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    var element = null;
    var clickedOnce = false;
    var classID;
	var ctx = canvas.getContext("2d")
	ctx.canvas.width = 808
	ctx.canvas.height = 608

    canvas.onmousemove = function (e) {
        setMousePosition(e);
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.strokeStyle = "#FF0000"
		ctx.beginPath()
		ctx.moveTo(0, e.offsetY)
		ctx.lineTo(canvas.width, e.offsetY)
		ctx.moveTo(e.offsetX, 0)
		ctx.lineTo(e.offsetX, canvas.height)
		ctx.stroke()
		ctx.strokeStyle = "#0000FF"
		
		if(clickedOnce){
			ctx.strokeRect(mouse.startX, mouse.startY, e.offsetX - mouse.startX, e.offsetY - mouse.startY)
		}
		
		
		for(i = 0; i < jsonObj["labels"].length; i++){
			ctx.strokeRect(jsonObj["labels"][i][1],jsonObj["labels"][i][2], jsonObj["labels"][i][3], jsonObj["labels"][i][4])
		}
		
    };

    canvas.onclick = function (e) {
		if(e.which == 3){
			if(clickedOnce){
				clickedOnce = false
				return
			}
		}
        if (element !== null) {
            element = null;
            canvas.style.cursor = "default";
        } else {
            mouse.startX = mouse.x;
            mouse.startY = mouse.y;
            element = document.createElement('div');
            element.className = 'rectangle';
            element.style.left = mouse.x + 'px';
            element.style.top = mouse.y + 'px';
			element.style.borderColor = rectangleColor;
            canvas.appendChild(element);
            canvas.style.cursor = "crosshair";
        }
        if (clickedOnce == true) {
            var e = document.getElementById('dropdown');
            strClassID = e.options[e.selectedIndex].getAttribute('id');
            classID = parseInt(strClassID)
            var dat = [classID, mouse.startX, mouse.startY, mouse.x - mouse.startX, mouse.y-mouse.startY]
            console.log("Writing label "+ dat)
            jsonObj['labels'].push([classID, mouse.startX, mouse.startY, mouse.x - mouse.startX, mouse.y-mouse.startY]);
            
            clickedOnce = false;
        } else clickedOnce = true;
        
        
        
    };
    canvas.redraw = function(){
		ctx.strokeStyle = "#0000FF"
		for(i = 0; i < jsonObj["labels"].length; i++){
			ctx.strokeRect(jsonObj["labels"][i][1],jsonObj["labels"][i][2], jsonObj["labels"][i][3], jsonObj["labels"][i][4])
		}

    };
    
}


// Clear labels function to clear all labels from the canvas.
// Deletes each child of the canvas object individually using removeChild()
// Can be modified to remove just the most recent child, oldest child, etc.
function clearLabels() {
	clearJson()
}

