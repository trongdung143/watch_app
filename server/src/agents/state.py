from langchain.agents import AgentState
from typing import Literal


class State(AgentState):
    google_api_key: str = ""
    model_name: str = ""
    action: Literal["chat", "clear-cache"] = "chat"
