from src.agents.workflow import graph
from src.api.utils import clean_text

import os
from fastapi.responses import FileResponse
from fastapi import APIRouter, Query
from langchain_core.messages import HumanMessage
from pydantic import BaseModel
from elevenlabs import AsyncElevenLabs

router = APIRouter()


class ChatRequest(BaseModel):
    uuid: str
    message: str
    audio: bool
    google_api_key: str
    model_name: str
    elevenlabs_api_key: str


@router.post("/chat")
async def chat(data: ChatRequest):
    try:
        input_state = {
            "messages": [HumanMessage(content=data.message)],
            "google_api_key": data.google_api_key,
            "model_name": data.model_name,
            "action": "chat",
        }
        config = {
            "configurable": {
                "thread_id": data.uuid,
            }
        }
        response = await graph.ainvoke(input_state, config)
        ai_response = response.get("messages", [])[-1].content
        if isinstance(ai_response, list):
            ai_response = ai_response[0].get("text", "tôi không hiểu bạn nói gì")

        ai_response = clean_text(ai_response)
        if data.audio and ai_response:
            client = AsyncElevenLabs(
                api_key=data.elevenlabs_api_key,
            )
            output_path = f"src/data/audio/{data.uuid}.mp3"
            with open(output_path, "wb") as f:
                async for chunk in client.text_to_speech.convert(
                    text=ai_response,
                    voice_id="FGY2WhTYpPnrIDTdsKH5",
                    model_id="eleven_flash_v2_5",
                    output_format="mp3_22050_32",
                ):
                    f.write(chunk)
        if not ai_response:
            ai_response = "NONE"
        return {"answer": ai_response, "audio": "READY" if data.audio else "NONE"}

    except Exception as e:
        print(e)
        return {"error": "Error calling model"}


@router.get("/tts")
async def get_tts(uuid: str = Query(...)):
    try:
        output_path = f"src/data/audio/{uuid}.mp3"
        return FileResponse(
            output_path,
            media_type="audio/mpeg",
            filename=f"{uuid}.mp3",
            headers={
                "Content-Length": str(os.path.getsize(output_path)),
                "Accept-Ranges": "bytes",
                "Cache-Control": "no-store",
            },
        )
    except Exception as e:
        print(e)
        return {"error": "Error retrieving TTS audio"}


@router.get("/clear_messages")
async def clear_cache(uuid: str = Query(...)):
    try:
        input_state = {
            "messages": [HumanMessage(content="clear messages")],
            "action": "clear_messages",
        }
        config = {
            "configurable": {
                "thread_id": uuid,
            }
        }
        await graph.ainvoke(input_state, config)
        return {"status": "CLEAR"}
    except Exception as e:
        print(e)
        return {"error": "Error clear messages"}
