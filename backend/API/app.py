from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2 as cv
import base64
import time
import os
import numpy as np
import imutils
from datetime import datetime
from unidecode import unidecode
import json 
import uuid

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})

# Configuración de rutas y modelos / cambiar para cada dispositivo
dataRuta = 'D:/SGV/9 ciclo/Machine/V1/backend/reconocimientofacial1/Data'
modelo_path = 'EntrenamientoEigenFaceRecognizer.xml'
haarcascade_path = r'D:\SGV\9 ciclo\Machine\V1\backend\entrenamientos opencv ruidos\opencv-master\data\haarcascades\haarcascade_frontalface_default.xml'

# Función para iniciar la cámara
def iniciar_camara():
    camara = cv.VideoCapture(0)
    if not camara.isOpened():
        raise Exception("No se pudo acceder a la cámara")
    return camara

@app.route('/api/entrenar', methods=['POST'])
def entrenar_modelo():
    lista_data = os.listdir(dataRuta)
    rostros_data = []
    ids = []
    nombres_estudiantes = {}

    if not lista_data:
        return jsonify({"error": "No hay imágenes para entrenar"}), 400

    for carpeta in lista_data:
        ruta_completa = os.path.join(dataRuta, carpeta)
        archivos = os.listdir(ruta_completa)
        
        if not archivos:
            continue
        
        # Extraer el ID y el nombre del estudiante de la carpeta
        partes = carpeta.split('_')
        if len(partes) < 3:
            continue  # O manejar el error de otra manera
        id_estudiante = int(partes[0])
        nombre_estudiante = ' '.join(partes[1:])

        nombres_estudiantes[str(id_estudiante)] = nombre_estudiante.replace("_", " ")

        for archivo in archivos:
            rostros_data.append(cv.imread(os.path.join(ruta_completa, archivo), 0))
            ids.append(id_estudiante)  # Usar el ID como entero
        
    if not rostros_data:
        return jsonify({"error": "No se encontraron datos de entrenamiento"}), 400

    # Entrena el modelo
    entrenamiento_eigen = cv.face.EigenFaceRecognizer_create()
    entrenamiento_eigen.train(rostros_data, np.array(ids))
    entrenamiento_eigen.write(modelo_path)

    # Guarda el diccionario de nombres en un archivo JSON
    with open("nombres_estudiantes.json", "w") as f:
        json.dump(nombres_estudiantes, f)

    return jsonify({"message": "Entrenamiento completado"})

# Endpoint para entrenar el modelo (capa de entrenamiento)
@app.route('/api/reconocer', methods=['POST'])
def reconocer_rostro():
    if not os.path.exists(modelo_path):
        return jsonify({"error": "Modelo no entrenado. Realice el entrenamiento primero."}), 400

    # Carga el modelo y el diccionario de nombres
    entrenamiento_eigen = cv.face.EigenFaceRecognizer_create()
    entrenamiento_eigen.read(modelo_path)
    
    # Cargar el diccionario de nombres de estudiantes
    with open("nombres_estudiantes.json", "r") as f:
        nombres_estudiantes = json.load(f)

    ruidos = cv.CascadeClassifier(haarcascade_path)

    try:
        camara = iniciar_camara()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    nombre_estudiante = "Desconocido"
    id_estudiante = None

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
            id_predicho, distancia = entrenamiento_eigen.predict(rostrocapturado)

            if distancia < 8000:
                id_predicho_str = str(id_predicho)
                # Busca el nombre del estudiante usando el ID predicho
                nombre_estudiante = nombres_estudiantes.get(id_predicho_str, "Desconocido")
                id_estudiante = id_predicho_str
                cv.rectangle(captura, (x, y), (x + e1, y + e2), (0, 255, 0), 2)
            else:
                nombre_estudiante = "Desconocido"
                id_estudiante = None
                cv.rectangle(captura, (x, y), (x + e1, y + e2), (0, 0, 255), 2)

            # Mostrar el nombre y el ID del estudiante en la ventana de reconocimiento
            cv.putText(captura, f"{nombre_estudiante} - {id_estudiante}", (x, y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        cv.imshow("Reconocimiento Facial", captura)
        
        if cv.waitKey(1) & 0xFF == ord('s'):  # Presionar 's' para salir
            break

    camara.release()
    cv.destroyAllWindows()
    
    return jsonify({"resultado": nombre_estudiante, "id_estudiante": id_estudiante})

# Endpoint para cargar estudiantes desde carpetas
@app.route('/api/cargar_estudiantes', methods=['GET'])
def cargar_estudiantes():
    estudiantes = []
    if not os.path.exists(dataRuta):
        os.makedirs(dataRuta)
    for carpeta in os.listdir(dataRuta):
        partes = carpeta.split('_')
        if len(partes) < 3:
            continue  # O manejar el error
        id_estudiante = partes[0]
        nombre = partes[1]
        apellido = partes[2]
        estudiantes.append({
            "id": id_estudiante,
            "nombre": nombre.replace("_", " "),
            "apellido": apellido.replace("_", " "),
            "curso": "Pendiente",
            "asistencia": 0,
            "ultimaAsistencia": None
        })
    return jsonify({"estudiantes": estudiantes})

@app.route('/api/agregar', methods=['POST'])
def agregar():
    data = request.get_json()
    nombre_estudiante = data.get("nombre_estudiante")
    apellido_estudiante = data.get("apellido_estudiante")

    if not nombre_estudiante:
        return jsonify({"error": "Debe proporcionar un nombre de estudiante"}), 400

    # Leer el último ID asignado
    with open("ultimo_id.json", "r") as f:
        ultimo_id_data = json.load(f)
        ultimo_id = ultimo_id_data.get("ultimo_id", 0)

    # Incrementar el ID para el nuevo estudiante
    id_estudiante = ultimo_id + 1

    # Actualizar el último ID asignado en el archivo
    with open("ultimo_id.json", "w") as f:
        json.dump({"ultimo_id": id_estudiante}, f)

    # Crear nombre de la carpeta basado en el ID y nombre del estudiante
    nombre_carpeta = f"{id_estudiante}_{unidecode(nombre_estudiante.replace(' ', '_'))}_{unidecode(apellido_estudiante.replace(' ', '_'))}"
    ruta_completa = os.path.join(dataRuta, nombre_carpeta)
    os.makedirs(ruta_completa, exist_ok=True)
    print(f"Ruta de guardado: {ruta_completa}")  # Confirma la ruta

    # Inicializar la captura de video
    try:
        camara = cv.VideoCapture(0)
        if not camara.isOpened():
            raise Exception("No se pudo abrir la cámara")
        #Cambiar las rutas
        ruidos = cv.CascadeClassifier(r'D:\SGV\9 ciclo\Machine\V1\backend\entrenamientos opencv ruidos\opencv-master\data\haarcascades\haarcascade_frontalface_default.xml')
        if ruidos.empty():
            raise Exception("Error al cargar el clasificador de cascada Haar.")

        id = 0
        cv.namedWindow("Capturando rostros", cv.WINDOW_NORMAL)

        while id < 350:
            respuesta, captura = camara.read()
            if not respuesta:
                print("Error: No se pudo capturar el fotograma")
                continue

            captura = imutils.resize(captura, width=640)
            grises = cv.cvtColor(captura, cv.COLOR_BGR2GRAY)
            cara = ruidos.detectMultiScale(grises, 1.3, 5)

            for (x, y, e1, e2) in cara:
                # Dibuja el cuadro verde alrededor de la cara
                cv.rectangle(captura, (x, y), (x + e1, y + e2), (0, 255, 0), 2)

                # Recorta y guarda la imagen de la cara
                rostrocapturado = captura[y:y + e2, x:x + e1]
                rostrocapturado = cv.resize(rostrocapturado, (160, 160), interpolation=cv.INTER_CUBIC)
                save_path = os.path.join(ruta_completa, f'imagen_{id}.jpg')
                
                # Verifica si la imagen se guarda correctamente
                if cv.imwrite(save_path, rostrocapturado):
                    print(f"Imagen guardada en {save_path}")
                else:
                    print(f"Error al guardar la imagen en {save_path}")
                
                id += 1  # Incrementa el contador después de guardar la imagen

                if id >= 350:
                    break  # Sal del bucle cuando hayas capturado 350 fotos

            # Muestra la imagen con el cuadro verde en una ventana
            cv.imshow("Capturando rostros", captura)

            # Espera 1 ms entre capturas y permite la salida manual con 'q'
            if cv.waitKey(1) & 0xFF == ord('q'):
                print("Captura interrumpida manualmente")
                break

        # Libera la cámara y cierra las ventanas
        camara.release()
        cv.destroyAllWindows()

        return jsonify({"message": "Captura de rostros completada"})

    except Exception as e:
        print("Error en captura de rostro:", e)
        return jsonify({"error": str(e)}), 500

# Cargar datos de estudiantes desde nombres_estudiantes.json
with open('nombres_estudiantes.json', 'r') as file:
    estudiantes = json.load(file)

def calcular_estado_horario(hora_actual):
    if hora_actual < datetime.strptime("07:00", "%H:%M"):
        return "Presente"
    elif hora_actual < datetime.strptime("07:30", "%H:%M"):
        return "Tardanza"
    else:
        return "No asistió"

@app.route('/api/reconocer_estudiante', methods=['POST'])
def reconocer_estudiante():

    try:
        # Verifica si el modelo existe
        if not os.path.exists(modelo_path):
            return jsonify({
                "mensaje": "El archivo del modelo no existe o fue eliminado. Por favor, realice el entrenamiento nuevamente.",
                "asistencia": None
            }), 400

        # Carga el modelo entrenado y el diccionario de nombres
        entrenamiento_eigen = cv.face.EigenFaceRecognizer_create()
        entrenamiento_eigen.read(modelo_path)

        try:
            with open("nombres_estudiantes.json", "r") as f:
                nombres_estudiantes = json.load(f)
        except FileNotFoundError:
            return jsonify({
                "mensaje": "El archivo de nombres no existe. Entrene el modelo primero.",
                "asistencia": None
            }), 500

        # Configuración de la cámara
        camara = cv.VideoCapture(0)
        if not camara.isOpened():
            return jsonify({
                "mensaje": "No se pudo abrir la cámara.",
                "asistencia": None
            }), 500

        face_cascade = cv.CascadeClassifier(haarcascade_path)
        tiempo_inicio = time.time()
        identificado = False
        id_estudiante = None
        nombre_estudiante = "Desconocido"

        while time.time() - tiempo_inicio < 10:  # Captura por 10 segundos
            ret, frame = camara.read()
            if not ret:
                continue

            # Procesa el fotograma
            gris = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
            rostros = face_cascade.detectMultiScale(gris, scaleFactor=1.3, minNeighbors=5)

            for (x, y, w, h) in rostros:
                rostro = gris[y:y + h, x:x + w]
                rostro_resized = cv.resize(rostro, (160, 160), interpolation=cv.INTER_CUBIC)

                # Predicción
                id_predicho, distancia = entrenamiento_eigen.predict(rostro_resized)

                if distancia < 8000:  # Ajustar el umbral según el modelo
                    id_estudiante = str(id_predicho)
                    nombre_estudiante = nombres_estudiantes.get(id_estudiante, "Desconocido")
                    identificado = True
                    break

            if identificado:
                break

        camara.release()
        cv.destroyAllWindows()

        if identificado:
            # Registra la asistencia del estudiante identificado
            hora_actual = datetime.now()

            if hora_actual.hour == 7 and hora_actual.minute <= 5:
                estado = "Presente"
            elif hora_actual.hour == 7 and 6 <= hora_actual.minute <= 10:
                estado = "Tardanza"
            elif hora_actual.hour == 8 and hora_actual.minute == 0:
                estado = "No asistió"
            else:
                estado = "No asistió"

            registro_asistencia = {
                "id": id_estudiante,
                "nombre": nombre_estudiante,
                "hora": hora_actual.strftime("%H:%M:%S"),
                "estado": estado
            }

            # Guardar asistencia en archivo JSON
            os.makedirs("asistencias", exist_ok=True)
            with open(f"asistencias/asistencia_{id_estudiante}.json", "w") as f:
                json.dump(registro_asistencia, f, indent=4)

            return jsonify({
                "mensaje": "Estudiante identificado",
                "asistencia": registro_asistencia
            }), 200
        else:
            return jsonify({
                "mensaje": "No se pudo identificar al estudiante",
                "asistencia": None
            }), 404

    except Exception as e:
        return jsonify({
            "mensaje": f"Error inesperado: {str(e)}",
            "asistencia": None
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)