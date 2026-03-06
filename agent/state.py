from typing import TypedDict, Optional

class AgentState(TypedDict):
    question: str
    context: Optional[str]
    answer: str