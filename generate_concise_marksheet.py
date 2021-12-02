import csv, shutil,sys

try:
    answer = []
    student = dict()
    
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
                    student[roll]=1                                     # Marking attendance
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
                    total_positive = float(int(positive*100))/100
                    total_marks = float(int(total_marks*100))/100

                    data[2] = str(total_positive)+"/"+str(total_marks)
                    data.insert(6,str(total)+"/"+str(total_marks))
                    data.insert(len(data),'['+str(correct)+','+str(incorrect)+','+str(unattempted)+']')
                    writer_obj.writerow(data)
            # Adding absent candidate data to concise marksheet
            with open('./input/master_roll.csv', 'r') as file:
                reader = csv.reader(file, delimiter=',', skipinitialspace=True)
                for data in reader:
                    if data[0]=="roll":
                        continue
                    try:
                        if student[data[0]]:
                            continue
                    except:
                        for i in range(len(answer)):
                            answer[i] = "..."
                        answer[0]="ABSENT"
                        answer[2]="ABSENT"
                        answer[6]="ABSENT"
                        answer[3]=data[1]
                        answer[7]=data[0]
                        writer_obj.writerow(answer)
            file.close()
        
        shutil.make_archive('./marksheet','zip','./output')
except Exception as e:
    print(e)