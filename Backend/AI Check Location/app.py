from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
from PIL import Image
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

model = load_model('./model.h5')

def preprocessImage(img):
    if img.shape[-1] != 3:
        img = img[:, :, :3]
    img = cv2.resize(img, (224, 224))
    img = img.astype('float32') / 255.0
    return img

@app.route("/api/checkLocation", methods=['POST'])
def checkLocation():
    try:
        json_data = request.json
        image = json_data.get('image')
        
        image_data = base64.b64decode(image.split(',')[1])
        img = np.array(Image.open(io.BytesIO(image_data)))

        preprocessed_image = preprocessImage(img)
        predictions = model.predict(preprocessed_image.reshape(1, 224, 224, 3))
        predicted_class = int(np.argmax(predictions))

        return jsonify({"status": "success", "message": predicted_class})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    app.run(debug=True)