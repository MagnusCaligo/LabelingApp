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


class MyHandler(web.RequestHandler):
	def check_origin(self, origin):
		return True
		
	def get(self):
		print "Person Connected!"
		self.render("index.html")

		
	def onClose(self):
		print "Someone left :("

		
class MyWebSocketHandler(websocket.WebSocketHandler):
	def check_origin(self, origin):
		return True
		
	def open(self):
		print "Web Socket Connected"
		self.pictureStack = []
		
	def onClose(self):
		print "Someone left :("
			
	def on_message(self, message):
		if message[0] == "1": # If we get a request for images
			self.sendImage()
		elif message[0] == "2": #If we get JSON Data
			message = message[1:]
			print "Got JSON Message: ", message
			recieveJson(message)
		elif message[0] == "3": #Go back an image on the stack
			if len(self.pictureStack) > 1:
				self.pictureStack.pop()
				self.sendImage(self.pictureStack[len(self.pictureStack)-1])
			
		
	def sendImage(self, *imageName):
		fileName = ""
		if len(imageName) == 0:
			fileName = random.choice(os.listdir("./unlabeledImages/"))
			self.pictureStack.append(fileName)
			fileName = "./unlabeledImages/" + fileName
		else:
			if imageName[0] in os.listdir("./labeledImages/"):
				fileName = "./labeledImages/" + imageName[0]
			elif imageName[0] in os.listdir("./unlabeledImages/"):
				fileName = "./unlabeledImages/" + imageName[0]
			else:
				return
		pictureID = fileName.split("/")[2].split(".")[0]
		self.write_message("Data ID " + pictureID)
		with open(fileName, "rb") as imageFile:
			encoded_string = base64.b64encode(imageFile.read())	
		self.write_message("Data" + encoded_string.encode('utf8'))
		
	

#moves fileName from unlabeled to labeled
def moveFile(fileName):
    if fileName not in os.listdir("./unlabeledImages/"):
        return
    destination = os.getcwd() + "/labeledImages/"
    source = os.getcwd() + "/unlabeledImages/"
    files = source + fileName
    shutil.move(files,destination)

def recieveJson(jsonString):
    JsonObj = json.loads(jsonString)
    picID = JsonObj['pictureID']
    txtName = str(picID) + '.txt'
    if picID == None or picID == "Null" or picID == "null":
		print "Picture id is Weird, what is it saving as?"
		print "Saving as", txtName
    files = open("./labels/" + txtName, 'w')

    for arr in JsonObj['labels']:
        for element in arr:
            files.write(str(element) + ', ')
        files.write("\n")

    moveFile(str(picID) + '.png')
		
class MyStaticFileHandler(web.StaticFileHandler):
    def set_extra_headers(self, path):
        # Disable cache
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

if __name__ == '__main__':
	app = web.Application([ (r'/', MyHandler),(r"/", MyWebSocketHandler), (r"/ws", MyWebSocketHandler),(r"/(.*)", MyStaticFileHandler, {"path": ".", "default_filename":"index.html"}),
	(r"/script.js", MyStaticFileHandler, {"path": ".", "default_filename":"index.html"})])
	app.listen(80)
	#ioloop.IOLoop.instance().add_handler(sys.stdin, onInput, ioloop.IOLoop.READ)
	ioloop.IOLoop.instance().start()
	