from fastapi import FastAPI
from pydantic import BaseModel
from agent.graph import agent_graph

app = FastAPI(title="RAG Codebase Agent")

class Query(BaseModel):
    question: str

@app.post("/")
def ask_agent(q: Query):
    result = agent_graph.invoke({"question": q.question})
    return {"answer": result["answer"]}
