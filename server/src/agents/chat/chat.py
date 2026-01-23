from src.agents.chat.prompt import prompt_chat
from src.agents.state import State
from src.agents.base import BaseAgent
from src.agents.chat.tool import tools

from langgraph.prebuilt.tool_node import tools_condition, ToolNode
from langchain_core.messages import AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI


class ChatState(State):
    output: str = ""


class ChatAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            agent_name="chat",
            model_name="gemini-3-flash",
            state=ChatState,
            tools=tools,
        )

        self._prompt = prompt_chat

        # self._chain = self._prompt | self._model

        self._tools_node = ToolNode(tools)

        self._set_subgraph()

    async def chat(self, state: ChatState) -> ChatState:
        try:
            model = ChatGoogleGenerativeAI(
                model=state.get("model_name"),
                google_api_key=state.get("google_api_key"),
                disable_streaming=True,
            ).bind_tools(tools)

            chain = self._prompt | model
            messages = state.get("messages")
            response = await chain.ainvoke({"messages": messages})
            output = response.content
            state.update(messages=[response], output=output)
        except Exception as e:
            print(e)
        return state

    def route(self) -> str:
        pass

    def _set_subgraph(self):
        self._sub_graph.add_node("tools", self._tools_node)
        self._sub_graph.add_node("chat", self.chat)

        self._sub_graph.set_entry_point("chat")
        self._sub_graph.add_conditional_edges(
            "chat", tools_condition, {"tools": "tools", "__end__": "__end__"}
        )
        self._sub_graph.add_edge("tools", "chat")

    async def process(self, state: State) -> State:
        try:
            sub_graph = self.get_subgraph()
            response = await sub_graph.ainvoke(state)
            output = response.get("output", "")
            state.update(messages=[AIMessage(content=output)])
        except Exception as e:
            pass

        return state
