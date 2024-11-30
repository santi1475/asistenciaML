# Proyecto de Asistencia con Reconocimiento Facial

Este proyecto permite la gestión de asistencia mediante reconocimiento facial. A continuación se presentan las instrucciones para iniciar el entorno de desarrollo.

## Recomendaciones
Cuando se quiera inciar el backend, se deben cambiar las rutas, por ejemplo:

```bash
dataRuta = 'D:/SGV/9 ciclo/Machine/V1/backend/reconocimientofacial1/Data'
haarcascade_path = r'D:\SGV\9 ciclo\Machine\V1\backend\entrenamientos opencv ruidos\opencv-master\data\haarcascades\haarcascade_frontalface_default.xml'

#Otro
ruidos = cv.CascadeClassifier(r'D:\SGV\9 ciclo\Machine\V1\backend\entrenamientos opencv ruidos\opencv-master\data\haarcascades\haarcascade_frontalface_default.xml')
```
Ahora este proyecto si o si requerira ciertos archivos llenos:
```bash
EntrenamientoEigenFaceRecognizer.xml
Fotos de 1 estudiante
```
Esto es por la falta aun de conexion con una BD, ademas de que se hace para la estabilidad del flujo del backend

## Instrucciones de inicio

Para iniciar el proyecto, ejecuta los siguientes comandos, en el orden que se esoecifica a continuacion:

```bash
# Iniciar el Backend
cd backend
cd API
python app.py

# Iniciar el Frontend
cd frontend
cd asistencia
npm run dev
```
## Dependencias 
Si no se inicializa el proyecto, instalar esta dependencia si es necesario
```bash
npm install lucide-react
pip install unidecode

