import os
from os import listdir
import re
replace_index = -1
template = []

with open("Icons-Template.svelte", 'r') as iconTemplate:
    for index, line in enumerate(iconTemplate):
        template.append(line)
        if 'const iconUrl' in line:
            replace_index = index

for index, line in enumerate(template):
    print(line)

os.chdir("../../assets")

for svgFile in listdir(os.curdir):
    orig_filename = svgFile
    os.chdir("../components/Icons")
    svgFile = svgFile.split(".")[0]
    svgFile = svgFile.split("-")
    for index, split in enumerate(svgFile):
        svgFile[index] = split.capitalize()
    svgFile = ''.join(svgFile)
    with open(svgFile + ".svelte", 'w+') as iconFile:
        for index, line in enumerate(template):
            if index == replace_index:
                iconFile.write(f'\tconst iconUrl = new URL("../../assets/{orig_filename}", import.meta.url);')
            else:
                iconFile.write(line)
    print(svgFile)

    os.chdir("../../assets")