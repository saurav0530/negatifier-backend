import os,shutil

try:
    os.mkdir("./output")
except FileExistsError:
    shutil.rmtree("./output")
    os.mkdir("./output")
    pass