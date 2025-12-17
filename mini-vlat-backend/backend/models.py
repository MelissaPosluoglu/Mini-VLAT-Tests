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
    test_id: str
    test_type: str
    difficulty: int
    mental_load: int
    stress: int
    confidence: int
    feedback_helpful: Optional[int] = None
    open_feedback: Optional[str] = None
    strategy_change: int
    vision_issue: Optional[str] = None
    vision_aid: Optional[str] = None
    test_time: Optional[str] = None
    fatigue: Optional[int] = None

