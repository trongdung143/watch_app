import re


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = re.sub(r"[\r\n\t]+", " ", text)
    text = re.sub(r"[\u200b\u200c\u200d\ufeff]", "", text)

    text = re.sub(r"[^a-zA-Z0-9À-ỹ .,!?;:'\"()-]", "", text)

    text = re.sub(r"\s+", " ", text)
    return text.strip()
