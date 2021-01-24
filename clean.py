import os
import filecmp

deleteTheseFiles = []
renameTheseFiles = []

last_file = None
for filename in os.listdir('.'):
	if filename.endswith('.jpg'):
		isDuplicated = False
		if last_file is not None:
			if filecmp.cmp(filename, last_file):
				isDuplicated = True
		if isDuplicated:
			deleteTheseFiles.append(filename)
		else:
			renameTheseFiles.append(filename)
	last_file = filename

counter = 0
for filename in renameTheseFiles:
	counter += 1
	os.rename(filename,str(counter).zfill(3) + '.jpg')

for filename in deleteTheseFiles:
	os.remove(filename)
		