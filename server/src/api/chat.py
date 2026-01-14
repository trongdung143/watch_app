from src.config.setup import ELEVENLABS_API_KEY
from src.agents.workflow import graph

from fastapi.responses import FileResponse
from fastapi import APIRouter
from langchain_core.messages import HumanMessage
from pydantic import BaseModel
from elevenlabs import AsyncElevenLabs

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class TTSRequest(BaseModel):
    text: str


client = AsyncElevenLabs(
    api_key=ELEVENLABS_API_KEY,
)


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


@router.post("/tts")
async def text_to_speech(data: TTSRequest):
    try:
        print("Generating TTS for text:", data.text)
        output_path = "src/data/audio/tts.mp3"

        with open(output_path, "wb") as f:
            async for chunk in client.text_to_speech.convert(
                text=data.text,
                voice_id="FGY2WhTYpPnrIDTdsKH5",
                model_id="eleven_flash_v2_5",
                output_format="mp3_44100_128",
            ):
                f.write(chunk)
        return {"status": "READY"}
    except Exception as e:
        return {"error": "Error in text to speech"}


@router.get("/tts")
async def get_tts():
    try:
        return FileResponse(
            "src/data/audio/tts.mp3", media_type="audio/mpeg", filename="tts.mp3"
        )
    except Exception as e:
        print(e)
        return {"error": "Error retrieving TTS audio"}
