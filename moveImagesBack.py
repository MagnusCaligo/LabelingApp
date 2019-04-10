#I made this for debuging to move the images back from labeled to unlabeled
import os
import shutil
for fileName in os.listdir("./labeledImages/"):
	if fileName[-3:] == "png":
		shutil.move("./labeledImages/" + fileName,"./unlabeledImages/" + fileName)