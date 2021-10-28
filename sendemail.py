import smtplib, ssl, csv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

port = 587  # For starttls
smtp_server = "smtp.gmail.com"
sender_email = "marks.negatifier.iitp@gmail.com"
receiver_email = "saurav_1901ee54@iitp.ac.in"
# receiver_email = "sauravkumar0530@gmail.com"
password = 'Saurav*9113'

# Create a secure SSL context
context = ssl.create_default_context()

# Try to log in to server and send email
try:
    server = smtplib.SMTP(smtp_server,port)
    server.ehlo() # Can be omitted
    server.starttls(context=context) # Secure the connection
    server.ehlo() # Can be omitted
    server.login(sender_email, password)
    with open('./input/responses.csv','r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', skipinitialspace=True)
        for data in reader:
            if data[6]=='Roll Number' or data[6]=='ANSWER':
                continue
            mail_content = "Dear "+data[3]+""",\nCS384 2021 marks are attached for reference.\n\nDr. Mayank"""
            message = MIMEMultipart()
            message['From'] = sender_email
            message['To'] = data[4].strip()
            message['Subject'] = 'Python Mark Sheet'
            message.attach(MIMEText(mail_content, 'plain'))
            marksheet_name = data[6]+'.xlsx'
            marksheet = open('./output/'+marksheet_name, 'rb')
            print(marksheet)
            payload = MIMEBase('application', 'octate-stream')
            payload.set_payload(marksheet.read())
            encoders.encode_base64(payload) #encode the attachment
            #add payload header with filename
            payload.add_header('Content-Disposition', 'attachment; filename='+marksheet_name)
            # print(payload)
            message.attach(payload)
            server.sendmail(sender_email, str(data[4].strip()), message.as_string())
            server.sendmail(sender_email, str(data[1].strip()), message.as_string())
except Exception as e:
    print(e)
finally:
    server.quit() 