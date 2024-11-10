import cv2 as cv
import os
import numpy as np
from time import time
dataRuta='D:/SGV/9 ciclo/Machine/V1/backend/reconocimientofacial1/Data'
listaData=os.listdir(dataRuta)
#print('data',listaData)
ids=[]
rostrosData=[]
id=0
tiempoInicial=time()
for fila in listaData:
    rutacompleta=dataRuta+'/'+ fila 
    print('Iniciando lectura...')
    for archivo in os.listdir(rutacompleta):
       
        print('Imagenes: ',fila +'/'+archivo)
    
        ids.append(id)
        rostrosData.append(cv.imread(rutacompleta+'/'+archivo,0))  
      

    id=id+1
    tiempofinalLectura=time()
    tiempoTotalLectura=tiempofinalLectura-tiempoInicial
    print('Tiempo total lectura: ',tiempoTotalLectura)

entrenamientoEigenFaceRecognizer=cv.face.EigenFaceRecognizer_create()
print('Iniciando el entrenamiento...espere')
entrenamientoEigenFaceRecognizer.train(rostrosData,np.array(ids))
TiempofinalEntrenamiento=time()
tiempoTotalEntrenamiento=TiempofinalEntrenamiento-tiempoTotalLectura
print('Tiempo entrenamiento total: ',tiempoTotalEntrenamiento)
entrenamientoEigenFaceRecognizer.write('EntrenamientoEigenFaceRecognizer.xml')
print('Entrenamiento concluido')

