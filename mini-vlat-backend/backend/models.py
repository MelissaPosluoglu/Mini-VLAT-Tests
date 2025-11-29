from pydantic import BaseModel
from typing import List, Optional


class AnswerEntry(BaseModel):
    question_id: str
    selected_answer: str
    correct_answer: str
    is_correct: bool
    time_taken: float


class StartTestRequest(BaseModel):
    username: str
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
    total_time: float
    score: int


class TestDocument(BaseModel):
    username: str
    test_type: str
    answers: List[AnswerEntry]
    total_time: Optional[float] = None
    score: Optional[int] = None
