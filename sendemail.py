from email.message import EmailMessage
import smtplib, csv, sys

port = 465
smtp_server = "smtp.gmail.com"
# sender_email = "marks.negatifier.iitp@gmail.com"
# password = 'Saurav*9113'
sender_email = "mail.checker.iitp@gmail.com"
password = 'Saurav*9113'

def send(message):
    try:
        server = smtplib.SMTP_SSL(smtp_server, port)
        server.login(sender_email, password)
        server.send_message(message)
        server.quit()
    except smtplib.SMTPException as e:
        print(e)
        pass

with open('./input/responses.csv','r') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', skipinitialspace=True)
    index = 0
    for data in reader:
        index+=1
        if data[6]=='Roll Number' or data[6]=='ANSWER':
            continue
        if(index==int(sys.argv[4])):
            mail_content = "Dear "+data[3]+",\n"+sys.argv[2]+"\n--\n"+sys.argv[3]
            message = EmailMessage()
            message['From'] = sender_email
            message['To'] = data[1].strip()
            message['Cc'] = data[4].strip()
            message['Subject'] = sys.argv[1]
            message.set_content(mail_content)
            marksheet_name = data[6]+'.xlsx'
            marksheet = open('./output/'+marksheet_name, 'rb')
            marks = marksheet.read()
            message.add_attachment(marks, maintype='application',subtype='octet-stream', filename=marksheet_name)
            send(message)
            print("Done")