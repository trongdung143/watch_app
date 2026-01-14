from tavily import AsyncTavilyClient
from src.config.setup import TAVILY_API_KEY
from langchain_core.tools import tool

sreacher = AsyncTavilyClient(api_key=TAVILY_API_KEY)

@tool
async def sreach(query: str) -> str:
    """
    Dùng để tìm kiếm thông tin, tin tức mới.

    Args:
        query (str): Nội dung cần tìm kiếm

    Returns:
        str: Nội dung tìm kiếm được.
    """

    response = await sreacher.search(
        query=query, include_raw_content="text", max_results=3
    )
    results = response.get("results")
    content = ""

    for result in results:
        content += result.get("content") + "\n\n"

    return content


tools = [sreach]