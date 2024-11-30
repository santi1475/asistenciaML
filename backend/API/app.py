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
asistencia_path = 'D:/SGV/9 ciclo/Machine/V1/backend/API/asistencias/asistencia.json'

# Función para iniciar la cámara
def iniciar_camara():
    camara = cv.VideoCapture(0)
    if not camara.isOpened():
        raise Exception("No se pudo acceder a la cámara")
    return camara

# Endpoint para entrenar el modelo de entrenamiento 
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

# Endpoint para reconocer quien es quien
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

# Endpoint para agregar un nuevo estudiante
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

#Endpoint para la asistencia de los estudiantes
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

        try:
            camara = iniciar_camara()
        except Exception as e:
            return jsonify({"error": str(e)}), 500

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
            estado = calcular_estado_horario(hora_actual)

            registro_asistencia = {
                "id": id_estudiante,
                "nombre": nombre_estudiante,
                "hora": hora_actual.strftime("%H:%M:%S"),
                "fecha": hora_actual.strftime("%d/%m/%Y"),
                "estado": estado
            }

            # Actualizar o crear el archivo asistencia.json
            archivo_asistencia = "asistencias/asistencia.json"
            os.makedirs("asistencias", exist_ok=True)
            try:
                with open(archivo_asistencia, "r") as f:
                    asistencias = json.load(f)

                    # Validar que asistencias sea una lista
                    if not isinstance(asistencias, list):
                        asistencias = []
            except (FileNotFoundError, json.JSONDecodeError):
                asistencias = []

            # Verificar si el estudiante ya tiene un registro
            actualizado = False
            for registro in asistencias:
                if isinstance(registro, dict) and registro.get("id") == id_estudiante and registro.get("fecha") == registro_asistencia["fecha"]:
                    registro.update(registro_asistencia)
                    actualizado = True
                    break

            if not actualizado:
                asistencias.append(registro_asistencia)

            with open(archivo_asistencia, "w") as f:
                json.dump(asistencias, f, indent=4)

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


#Funciones para los datos estadisticos    
def calcular_estadisticas():
    if not os.path.exists(asistencia_path):
        return {
            "error": "Archivo de asistencias no encontrado.",
            "presente": 0,
            "tardanza": 0,
            "falta": 100
        }

    try:
        with open(asistencia_path, "r", encoding="utf-8") as file:
            data = json.load(file)

            # Validar que el archivo contiene una lista
            if not isinstance(data, list):
                return {
                "error": "El archivo JSON no contiene una lista válida.",
                    "presente": 0,
                    "tardanza": 0,
                    "falta": 100
                }

            # Inicializar contadores
            total_registros = len(data)
            estadisticas = {"Presente": 0, "Tardanza": 0, "No asistió": 0}

            # Contar las ocurrencias de cada estado
            for registro in data:
                estado = registro.get("estado", "")
                if estado in estadisticas:
                    estadisticas[estado] += 1

            # Calcular porcentajes
            presente_pct = (estadisticas[" "] / total_registros) * 100 if total_registros > 0 else 0
            tardanza_pct = (estadisticas["Tardanza"] / total_registros) * 100 if total_registros > 0 else 0
            falta_pct = (estadisticas["No asistió"] / total_registros) * 100 if total_registros > 0 else 0

            return {
                "presente": round(presente_pct, 2),
                "tardanza": round(tardanza_pct, 2),
                "falta": round(falta_pct, 2)
            }

    except json.JSONDecodeError:
        return {
            "error": "Error al leer o parsear el archivo JSON.",
            "presente": 0,
            "tardanza": 0,
            "falta": 100
        }
    except Exception as e:
        return {
            "error": f"Error inesperado: {str(e)}",
            "presente": 0,
            "tardanza": 0,
            "falta": 100
        }

#Endpoint para mandar las estadisticas
@app.route("/api/estadisticas", methods=["GET"])
def obtener_estadisticas():
    """
    Endpoint para obtener estadísticas de asistencia.
    """
    estadisticas = calcular_estadisticas()
    return jsonify(estadisticas)

@app.route("/api/estudiantes", methods=['GET'])
def obtener_estudiantes():
    try:
        # Leer el archivo JSON con los registros de asistencia
        with open(asistencia_path, 'r', encoding='utf-8') as f:
            asistencias = json.load(f)

        # Asegurarse de que `asistencias` sea una lista, incluso si es un solo registro
        if isinstance(asistencias, dict):
            asistencias = [asistencias]  # Convertir un único objeto en una lista

        if not isinstance(asistencias, list):
            raise ValueError("El archivo JSON debe contener una lista o un único objeto de asistencias.")

        # Agrupar los registros por estudiante
        estudiantes = {}

        for registro in asistencias:
            # Validar que todos los campos necesarios estén presentes
            if not all(key in registro for key in ['nombre', 'fecha', 'hora', 'estado']):
                raise ValueError("Faltan claves en uno o más registros de asistencia.")

            nombre = registro['nombre']
            fecha_hora = f"{registro['fecha']} {registro['hora']}"
            estado = registro['estado']

            # Si el estudiante no existe en el diccionario, inicializarlo
            if nombre not in estudiantes:
                estudiantes[nombre] = {
                    'id': registro.get('id', 'Desconocido'),  # Usar el ID si está disponible
                    'nombre': nombre,
                    'ultimo_registro': fecha_hora,
                    'total_asistencias': 0,
                    'total_sesiones': 0
                }

            # Actualizar el último registro
            estudiantes[nombre]['ultimo_registro'] = fecha_hora

            # Contabilizar la asistencia y el total de sesiones
            estudiantes[nombre]['total_sesiones'] += 1
            if estado == "Asistió":
                estudiantes[nombre]['total_asistencias'] += 1

        # Calcular el porcentaje de asistencia para cada estudiante
        estudiantes_info = []
        for estudiante in estudiantes.values():
            if estudiante['total_sesiones'] > 0:
                porcentaje_asistencia = (estudiante['total_asistencias'] / estudiante['total_sesiones']) * 100
            else:
                porcentaje_asistencia = 0.0  # Si no hay sesiones registradas, el porcentaje es 0
            estudiante['porcentaje_asistencia'] = round(porcentaje_asistencia, 2)
            estudiantes_info.append(estudiante)

        return jsonify({"estudiantes": estudiantes_info})

    except ValueError as ve:
        return jsonify({"error": f"Hubo un error con los datos: {str(ve)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Hubo un error al procesar los datos: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)