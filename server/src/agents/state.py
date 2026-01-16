from langchain.agents import AgentState


class State(AgentState):
    google_api_key: str
    model_name: str
    pass
