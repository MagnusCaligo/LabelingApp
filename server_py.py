import socket
import os
import shutil
import json
import random as rand
import base64
from tornado import web, websocket, ioloop
import random
import os
import sys

clients = []

class MySocket(web.RequestHandler):
	def check_origin(self, origin):
		return True
		
	def get(self):
		print "Person Connected!"
		self.render("index.html")
		if not self in clients:
			clients.append(self)
		
	def onClose(self):
		print "Someone left :("
		if self in clients:
			clients.remove(self)
			
	def on_message(self, message):
		print "Got Message from Client"
		if message[0] == "1": # If we get a request for images
			sendImage(self)
		elif message[1] == "2": #If we get JSON Data
			pass
		
class MyWebSocketHandler(websocket.WebSocketHandler):
	def check_origin(self, origin):
		return True
		
	def open(self):
		print "Web Socket Connected"
		
	def onClose(self):
		print "Someone left :("
		if self in clients:
			clients.remove(self)
			
	def on_message(self, message):
		print "Got Message from Client"
		if message[0] == "1": # If we get a request for images
			sendImage(self)
		elif message[1] == "2": #If we get JSON Data
			pass
		

		
	

#moves fileName from unlabeled to labeled
def moveFile(fileName):
    destination = os.getcwd() + "/labeled"
    source = os.getcwd() + "/unlabeled"
    files = source + "/" + fileName
    shutil.move(files,destination)
    print("Moving file")


#takes in a socket object as a parameter
def sendImage(conn):
		fileName = random.choice(os.listdir("./unlabeledImages/"))
		pictureID = fileName.split(".")[0]
		conn.write_message("Data ID " + pictureID)
		with open("./unlabeledImages/" + fileName, "rb") as imageFile:
			encoded_string = base64.b64encode(imageFile.read())	
		conn.write_message("Data" + encoded_string.encode('utf8'))
		print("Done sending")
    

def formatJson(conn):
    data = conn.recv(1024)
    buf = data.decode('utf-8')
    count = 0
    while (data):
        print(count)
        count += 1
        data = conn.recv(1024)
        buf += data.decode('utf-8')
    
    return buf

def recieveJson(conn):
    JsonObj = json.loads(formatJson(conn))
    print("Picture ID: ", JsonObj['pictureID'])
    print(JsonObj)
    picID = JsonObj['pictureID']
    txtName = str(picID) + '.txt'
    files = open(txtName, 'w')

    for arr in JsonObj['labels']:
        for element in arr:
            files.write(str(element) + ', ')

    moveFile(str(picID) + '.png')
		
class MyStaticFileHandler(web.StaticFileHandler):
    def set_extra_headers(self, path):
        # Disable cache
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

if __name__ == '__main__':
	app = web.Application([ (r'/', MySocket),(r"/", MyWebSocketHandler), (r"/ws", MyWebSocketHandler),(r"/(.*)", MyStaticFileHandler, {"path": ".", "default_filename":"index.html"}),
	(r"/script.js", MyStaticFileHandler, {"path": ".", "default_filename":"index.html"})])
	app.listen(80)
	#ioloop.IOLoop.instance().add_handler(sys.stdin, onInput, ioloop.IOLoop.READ)
	ioloop.IOLoop.instance().start()
	