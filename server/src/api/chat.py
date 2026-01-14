from fastapi import APIRouter
from langchain_core.messages import HumanMessage
from src.agents.workflow import graph
from pydantic import BaseModel

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def chat(data: ChatRequest):
    try:
        input_state = {"messages": [HumanMessage(content=data.message)]}
        config = {"configurable": {"thread_id": "123"}}
        response = await graph.ainvoke(input_state, config)
        ai_response = response.get("messages", [])[-1].content
        if isinstance(ai_response, list):
            ai_response = ai_response[0].get("text", "tôi không hiểu bạn nói gì")
        return {"answer": ai_response}

    except Exception as e:
        return {"error": "Error calling model"}
