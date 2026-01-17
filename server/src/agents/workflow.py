from langgraph.graph import StateGraph
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.message import REMOVE_ALL_MESSAGES
from langchain.messages import RemoveMessage


from src.agents.state import State
from src.agents.chat.chat import ChatAgent


VALID_AGENTS = ["chat"]


def start(state: State) -> State:
    return state


def end(state: State) -> State:
    print(state)
    return state


def route(state: State) -> str:
    return state.get("action")


def clear_messages(state: State) -> State:
    state.update(messages=[RemoveMessage(id=REMOVE_ALL_MESSAGES)])
    return state


chat = ChatAgent()
workflow = StateGraph(State)

workflow.add_node("start", start)
workflow.add_node("end", end)
workflow.add_node("chat", chat.process)
workflow.add_node("clear_messages", clear_messages)

workflow.set_entry_point("start")
workflow.add_conditional_edges(
    "start", route, {"chat": "chat", "clear_messages": "clear_messages"}
)
workflow.add_edge("chat", "end")
workflow.add_edge("clear_messages", "end")

graph = workflow.compile(checkpointer=MemorySaver())
