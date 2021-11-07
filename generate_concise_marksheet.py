import csv, shutil,sys

try:
    answer = []
    with open('./input/responses.csv','r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', skipinitialspace=True)
        for data in reader:
            if(data[6]=="ANSWER"):
                answer = data
                break
    if(len(answer)==0):
        print('00')
    else:
        with open('./output/concise_markheet.csv', 'w', newline='') as file:
            writer_obj = csv.writer(file)
            with open('./input/responses.csv','r') as csvfile:
                reader = csv.reader(csvfile, delimiter=',', skipinitialspace=True)
                for data in reader:
                    roll = data[6]
                    if(roll=='Roll Number'):
                        for i in range(7,len(data)):
                            data[i]="Unnamed: "+str(i)
                        data.insert(6,'Score_After_Negative')
                        data.insert(len(data),'statusAns')
                        writer_obj.writerow(data)
                        continue
                    correct=0
                    incorrect=0
                    unattempted=0

                    for i in range(7,len(data)):
                        if(data[i]==""):
                            unattempted+=1
                        elif(data[i]==answer[i]):
                            correct+=1
                        else:
                            incorrect+=1

                    positive = float(sys.argv[1])*correct
                    negative = float(sys.argv[2])*incorrect
                    total = positive+negative
                    total_marks = float(sys.argv[1])*(correct+incorrect+unattempted)
                    total = float(int(total*100))/100
                    total_marks = float(int(total_marks*100))/100

                    data.insert(6,str(total)+"/"+str(total_marks))
                    data.insert(len(data),'['+str(correct)+','+str(incorrect)+','+str(unattempted)+']')
                    writer_obj.writerow(data)
            file.close()
        shutil.make_archive('./marksheet','zip','./output')
except Exception as e:
    print(e)