from pydantic import BaseModel
from typing import List, Optional


class AnswerEntry(BaseModel):
    question_id: str
    selected_answer: str
    correct_answer: str
    is_correct: bool
    time_taken: float


class StartTestRequest(BaseModel):
    participantNumber: str
    test_type: str  # "A", "B", "C"


class StartTestResponse(BaseModel):
    test_id: str


class AnswerRequest(BaseModel):
    test_id: str
    question_id: str
    selected_answer: str
    correct_answer: str
    is_correct: bool
    time_taken: float


class FinishRequest(BaseModel):
    test_id: str
    total_time: Optional[float] = None
    score: Optional[int] = None

class TestDocument(BaseModel):
    participantNumber: str
    test_type: str
    answers: List[AnswerEntry]
    total_time: Optional[float] = None
    score: Optional[int] = None

class FeedbackRequest(BaseModel):
    # -------------------------
    # Zuordnung
    # -------------------------
    test_id: str
    test_type: str

    # -------------------------
    # Schwierigkeit / Cognitive Load
    # (Skala 1 = sehr gering, 5 = sehr stark)
    # -------------------------
    difficulty: int
    mental_load: int
    stress: int
    confidence: int

    # NASA-TLX-relevant (direkt erhoben)
    temporal_demand: Optional[int] = None
    physical_demand: Optional[int] = None

    # -------------------------
    # Verständnis & Strategie
    # -------------------------
    task_understanding: Optional[int] = None
    strategy_change: int

    # -------------------------
    # Sehvermögen
    # -------------------------
    vision_issue: Optional[str] = None      # "yes" | "no"
    vision_type: Optional[str] = None       # "short_sighted" | "long_sighted" | "both"
    vision_aid: Optional[str] = None        # "glasses" | "contacts" | "none"

    # -------------------------
    # Testumgebung
    # -------------------------
    eye_tracking_issue: Optional[int] = None
    distraction: Optional[int] = None
    fatigue: Optional[int] = None
    test_time: Optional[str] = None         # "morning" | "midday" | "evening" | "night"

    # -------------------------
    # Erfahrung
    # -------------------------
    visualization_experience: Optional[int] = None
    viz_test_experience: Optional[int] = None

    # -------------------------
    # Demographische Daten
    # -------------------------
    age: Optional[int] = None
    gender: Optional[str] = None
    field_of_study: Optional[str] = None

    # -------------------------
    # Freitext
    # -------------------------
    open_feedback: Optional[str] = None