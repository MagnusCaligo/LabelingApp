from tornado import websocket, web, ioloop
import json
from PIL import Image
import base64

cl = []

class SocketHandler(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        if self not in cl:
            cl.append(self)
        self.write_message("Test")
        self.sendImage()
    

    def on_close(self):
        if self in cl:
            cl.remove(self)
			
    def sendImage(self):
		fileName = 'lena.jpg'
		img = Image.open(fileName)
		img.close()
		width, height = img.size
		self.write_message(str(width) + "," + str(height) + ",")
		with open(fileName, "rb") as imageFile:
			encoded_string = base64.b64encode(imageFile.read())	
		self.write_message(encoded_string.encode('utf8'))
		print len(encoded_string.encode('utf8'))
		print("Done sending")


app = web.Application([
    (r'/', SocketHandler)
])

if __name__ == '__main__':
    app.listen(5000)
    ioloop.IOLoop.instance().start()