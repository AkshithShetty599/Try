from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io
from utils import preprocess_image
import os

app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

# CORS configuration to allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Update if frontend URL changes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Load the trained model
model = load_model("model/heart_risk_model.h5")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Read the uploaded image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Preprocess the image
        processed = preprocess_image(image)  # Make sure it returns a NumPy array

        # Model expects shape: (1, height, width, channels)
        prediction = model.predict(np.expand_dims(processed, axis=0))[0][0]

        # Convert NumPy types to native Python types
        is_risk = bool(prediction > 0.5)
        label = "Heart Risk Detected" if is_risk else "No Heart Risk"
        confidence = float(prediction)

        # Return properly encoded JSON response
        return JSONResponse(content={
            "label": label,
            "confidence": confidence,
            "isRisk": is_risk
        })

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
