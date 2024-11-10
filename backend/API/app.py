from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2 as cv
import os
import numpy as np
import imutils
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})    

# Configuración de rutas y modelos
dataRuta = 'D:/SGV/9 ciclo/Machine/V1/backend/reconocimientofacial1/Data'
modelo_path = 'EntrenamientoEigenFaceRecognizer.xml'

# Endpoint para capturar imágenes de rostros y almacenarlas (capa de entrada)
@app.route('/api/captura_rostro', methods=['POST'])
def captura_rostro():
    modelo = datetime.now().strftime("%Y%m%d%H%M%S")
    ruta_completa = os.path.join(dataRuta, modelo)
    os.makedirs(ruta_completa, exist_ok=True)
    
    camara = cv.VideoCapture(0)
    ruidos = cv.CascadeClassifier(r'D:\SGV\9 ciclo\Machine\V1\backend\entrenamientos opencv ruidos\opencv-master\data\haarcascades\haarcascade_frontalface_default.xml')
    
    id = 0
    while id < 350:
        respuesta, captura = camara.read()
        if not respuesta:
            break
        captura = imutils.resize(captura, width=640)
        grises = cv.cvtColor(captura, cv.COLOR_BGR2GRAY)
        cara = ruidos.detectMultiScale(grises, 1.3, 5)

        for (x, y, e1, e2) in cara:
            rostrocapturado = captura[y:y + e2, x:x + e1]
            rostrocapturado = cv.resize(rostrocapturado, (160, 160), interpolation=cv.INTER_CUBIC)
            cv.imwrite(os.path.join(ruta_completa, f'imagen_{id}.jpg'), rostrocapturado)
            id += 1

        if cv.waitKey(1) & 0xFF == ord('q'):
            break

    camara.release()
    cv.destroyAllWindows()
    
    return jsonify({"message": "Captura de rostros completada"})


# Endpoint para entrenar el modelo (capa de entrenamiento)
@app.route('/api/entrenar', methods=['POST'])
def entrenar_modelo():
    lista_data = os.listdir(dataRuta)
    rostros_data = []
    ids = []
    id = 0

    # Verificar que hay carpetas con imágenes para entrenar
    if not lista_data:
        return jsonify({"error": "No hay imágenes para entrenar"}), 400

    for carpeta in lista_data:
        ruta_completa = os.path.join(dataRuta, carpeta)
        archivos = os.listdir(ruta_completa)
        
        # Verificar que cada carpeta tenga imágenes
        if not archivos:
            continue
        
        for archivo in archivos:
            rostros_data.append(cv.imread(os.path.join(ruta_completa, archivo), 0))
            ids.append(id)
        id += 1

    if not rostros_data:
        return jsonify({"error": "No se encontraron datos de entrenamiento"}), 400

    # Entrenamiento del modelo
    entrenamiento_eigen = cv.face.EigenFaceRecognizer_create()
    entrenamiento_eigen.train(rostros_data, np.array(ids))
    entrenamiento_eigen.write(modelo_path)
    
    return jsonify({"message": "Entrenamiento completado"})


# Endpoint para el reconocimiento facial (capa de salida)
@app.route('/api/reconocer', methods=['POST'])
def reconocer_rostro():
    entrenamiento_eigen = cv.face.EigenFaceRecognizer_create()
    entrenamiento_eigen.read(modelo_path)
    ruidos = cv.CascadeClassifier(r'D:\SGV\9 ciclo\Machine\V1\backend\entrenamientos opencv ruidos\opencv-master\data\haarcascades\haarcascade_frontalface_default.xml')
    
    camara = cv.VideoCapture(0)
    resultado_final = "Desconocido"

    while True:
        respuesta, captura = camara.read()
        if not respuesta:
            break
        captura = imutils.resize(captura, width=640)
        grises = cv.cvtColor(captura, cv.COLOR_BGR2GRAY)
        cara = ruidos.detectMultiScale(grises, 1.3, 5)

        for (x, y, e1, e2) in cara:
            rostrocapturado = grises[y:y + e2, x:x + e1]
            rostrocapturado = cv.resize(rostrocapturado, (160, 160), interpolation=cv.INTER_CUBIC)
            resultado = entrenamiento_eigen.predict(rostrocapturado)

            if resultado[1] < 8000:
                resultado_final = "Aprobado"
                cv.rectangle(captura, (x, y), (x + e1, y + e2), (0, 255, 0), 2)
            else:
                resultado_final = "Denegado"
                cv.rectangle(captura, (x, y), (x + e1, y + e2), (0, 0, 255), 2)

        cv.imshow("Resultados", captura)
        
        if cv.waitKey(1) & 0xFF == ord('s'):
            break

    camara.release()
    cv.destroyAllWindows()
    
    return jsonify({"resultado": resultado_final})

# EndPoint de agregar alumnos
@app.route('/api/agregar', methods=['OPTIONS', 'POST'])
def agregar():
    if request.method == 'OPTIONS':
        # Respuesta rápida para la solicitud OPTIONS preflight
        return jsonify({"success": True}), 200
    
    data = request.get_json()
    nombre_estudiante = data.get("nombre_estudiante")
    
    if not nombre_estudiante:
        return jsonify({"error": "Debe proporcionar un nombre de estudiante"}), 400

    # Crear ruta de almacenamiento
    ruta_completa = os.path.join(dataRuta, nombre_estudiante)
    os.makedirs(ruta_completa, exist_ok=True)
    
    camara = cv.VideoCapture(0)
    ruidos = cv.CascadeClassifier(r'D:\SGV\9 ciclo\Machine\V1\backend\entrenamientos opencv ruidos\opencv-master\data\haarcascades\haarcascade_frontalface_default.xml')
    id = 0

    while id < 350:
        respuesta, captura = camara.read()
        if not respuesta:
            break
        captura = imutils.resize(captura, width=640)
        grises = cv.cvtColor(captura, cv.COLOR_BGR2GRAY)
        cara = ruidos.detectMultiScale(grises, 1.3, 5)

        for (x, y, e1, e2) in cara:
            rostrocapturado = captura[y:y + e2, x:x + e1]
            rostrocapturado = cv.resize(rostrocapturado, (160, 160), interpolation=cv.INTER_CUBIC)
            cv.imwrite(os.path.join(ruta_completa, f'imagen_{id}.jpg'), rostrocapturado)
            id += 1

        if cv.waitKey(1) & 0xFF == ord('q'):
            break

    camara.release()
    cv.destroyAllWindows()
    
    return jsonify({"message": "Captura de rostros completada"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
