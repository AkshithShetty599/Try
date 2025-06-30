# backend/utils.py
from PIL import Image
import numpy as np

def preprocess_image(image: Image.Image, target_size=(224, 224)) -> np.ndarray:
    image = image.resize(target_size)
    image_array = np.array(image) / 255.0
    return image_array
