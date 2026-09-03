import pandas as pd
import joblib

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal


# -------------------------------------------------
# Load Model
# -------------------------------------------------

model = joblib.load("mental_health_model.pkl")


# -------------------------------------------------
# FastAPI App
# -------------------------------------------------

app = FastAPI()


# -------------------------------------------------
# CORS
# -------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------
# Input Data Schema
# -------------------------------------------------

class StudentData(BaseModel):

    Age: int = Field(..., ge=10, le=100)

    Gender: Literal[
        "Male",
        "Female"
    ]

    Country: str

    Academic_Level: Literal[
        "Undergraduate",
        "Graduate",
        "High School"
    ]

    Most_Used_Platform: Literal[
        "Facebook",
        "LinkedIn",
        "Instagram",
        "Snapchat",
        "Twitter",
        "YouTube",
        "TikTok",
        "LINE",
        "KakaoTalk",
        "VKontakte",
        "WhatsApp",
        "WeChat"
    ]

    Purpose_Of_Use: Literal[
        "Networking",
        "Education",
        "Entertainment",
        "News"
    ]

    # ✅ 0 to 24 hours
    Avg_Daily_Usage_Hours: float = Field(
        ...,
        ge=0,
        le=24
    )

    Daily_Unlocks: int = Field(
        ...,
        ge=0
    )

    Study_Hours: float = Field(
        ...,
        ge=0,
        le=24
    )

    Physical_Activity_Hours: float = Field(
        ...,
        ge=0,
        le=24
    )

    Sleep_Hours_Per_Night: float = Field(
        ...,
        ge=0,
        le=24
    )

    Stress_Level: Literal[
        "Medium",
        "Low",
        "Very High",
        "High"
    ]


# -------------------------------------------------
# Output Schema
# -------------------------------------------------

class PredictionResponse(BaseModel):

    predicted_mental_health_score: float


# -------------------------------------------------
# Home Route
# -------------------------------------------------

@app.get("/")
def greet():

    return {
        "message": "Welcome hai aapka yahan!"
    }


# -------------------------------------------------
# Top Countries
# -------------------------------------------------

top_countries = [
    "Other",
    "India",
    "USA",
    "Canada",
    "Australia",
    "UK",
    "Germany",
    "Mexico",
    "Turkey",
    "France"
]


# -------------------------------------------------
# Prediction Route
# -------------------------------------------------

@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(data: StudentData):

    # ---------------------------------------------
    # Group countries
    # ---------------------------------------------

    country_group = (
        data.Country
        if data.Country in top_countries
        else "Other"
    )

    # ---------------------------------------------
    # Convert input into DataFrame
    # ---------------------------------------------

    input_row = pd.DataFrame([
        {
            "Age": data.Age,

            "Gender": data.Gender,

            "Country": data.Country,

            "Academic_Level": data.Academic_Level,

            "Most_Used_Platform":
                data.Most_Used_Platform,

            "Purpose_Of_Use":
                data.Purpose_Of_Use,

            "Avg_Daily_Usage_Hours":
                data.Avg_Daily_Usage_Hours,

            "Daily_Unlocks":
                data.Daily_Unlocks,

            "Study_Hours":
                data.Study_Hours,

            "Physical_Activity_Hours":
                data.Physical_Activity_Hours,

            "Sleep_Hours_Per_Night":
                data.Sleep_Hours_Per_Night,

            "Stress_Level":
                data.Stress_Level,

            "Grouped_countries":
                country_group
        }
    ])

    # ---------------------------------------------
    # Prediction
    # ---------------------------------------------

    prediction = model.predict(input_row)[0]

    # ---------------------------------------------
    # Response
    # ---------------------------------------------

    return PredictionResponse(
        predicted_mental_health_score=round(
            float(prediction),
            2
        )
    )