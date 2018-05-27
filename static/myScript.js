var rectangleColor = '#0099ff';
var ws = new WebSocket("ws://66.75.229.184:80/ws")
var workingPictureID;
    

ws.onopen = function(){
	console.log("Connected")
	ws.send("1")
}

var jsonObj = {
	labels: [],
	pictureID: null
}

ws.onmessage = function (event) {
	//console.log(event.data);
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
	}else{
		
	}

}

function getNewImage(){
	ws.send("2" + JSON.stringify(jsonObj))
	ws.send("1");
	clearJson();
	clearLabels();
}

function getPreviousImage(){
	ws.send("3");
}

function clearJson(){
	jsonObj = {
		labels: [],
		pictureID: null
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

            jsonObj['labels'].push([classID, mouse.startX, mouse.startY, mouse.x - mouse.startX, mouse.y-mouse.startY]);
            
            clickedOnce = false;
        } else clickedOnce = true;
        
        
        
    };
    
}


// Clear labels function to clear all labels from the canvas.
// Deletes each child of the canvas object individually using removeChild()
// Can be modified to remove just the most recent child, oldest child, etc.
function clearLabels() {
	clearJson()
}

