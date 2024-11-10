import cv2 as cv
import os
import imutils
from datetime import datetime

# Generar un nombre único para cada nuevo rostro ingresado
modelo = datetime.now().strftime("%Y%m%d%H%M%S")
ruta1 = 'D:/SGV/9 ciclo/Machine/V1/backend/reconocimientofacial1/Data'
rutacompleta = os.path.join(ruta1, modelo)
if not os.path.exists(rutacompleta):
    os.makedirs(rutacompleta)

camara = cv.VideoCapture(0)
ruidos = cv.CascadeClassifier(r'D:\SGV\ 9 ciclo\Machine\V1\backend\entrenamientos opencv ruidos\opencv-master\data\haarcascades\haarcascade_frontalface_default.xml')

id = 0
while True:
    respuesta, captura = camara.read()
    if not respuesta:
        break
    captura = imutils.resize(captura, width=640)

    grises = cv.cvtColor(captura, cv.COLOR_BGR2GRAY)
    idcaptura = captura.copy()

    cara = ruidos.detectMultiScale(grises, 1.3, 5)

    for (x, y, e1, e2) in cara:
        cv.rectangle(captura, (x, y), (x + e1, y + e2), (0, 255, 0), 2)
        rostrocapturado = idcaptura[y:y + e2, x:x + e1]
        rostrocapturado = cv.resize(rostrocapturado, (160, 160), interpolation=cv.INTER_CUBIC)
        cv.imwrite(os.path.join(rutacompleta, f'imagen_{id}.jpg'), rostrocapturado)
        id += 1

    cv.imshow("Capturando rostros", captura)

    if id == 350 or cv.waitKey(1) & 0xFF == ord('q'):
        break

camara.release()
cv.destroyAllWindows()