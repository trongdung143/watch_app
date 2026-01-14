from langchain_core.prompts import ChatPromptTemplate

prompt_chat = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            Bạn là một trợ lý ảo, người trò chuyện.
            Kết quả đầu ra phải là văn bản thuần text.
            Trả lời một cách ngắn gọn và súc tích nhất có thể.
            
            Nếu cần để thực hiện yêu cầu của người dùng, bạn có thể sử dụng các công cụ (tool) sẵn có.
            Tuy nhiên, chỉ sử dụng tool khi thật sự cần.
            """,
        ),
        ("placeholder", "{messages}"),
    ]
)
