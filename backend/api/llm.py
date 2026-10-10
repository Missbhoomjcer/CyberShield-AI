from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import ollama

router = APIRouter(prefix="/chat", tags=["Chatbot"])


class ChatRequest(BaseModel):
    message: str


@router.post("/")
async def chat(request: ChatRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    try:
        response = ollama.chat(
            model="llama3.2:3b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are CyberShield AI, the conversational "
                        "assistant for a cybersecurity platform. "
                        "You can answer general questions, greetings, "
                        "and cybersecurity questions. "
                        "Always understand and answer the user's latest "
                        "message directly. Do not repeat an earlier answer "
                        "unless the user asks you to repeat it. "
                        "For unrelated questions, do not give a ransomware "
                        "explanation. "
                        "For cybersecurity questions, provide accurate, "
                        "clear, practical explanations. "
                        "Explain technical topics in simple language when "
                        "appropriate. "
                        "Do not invent scan results, detections, or actions "
                        "performed by the CyberShield platform. "
                        "Be friendly, natural, and concise."
                    )
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            options={
                "temperature": 0.7,
                "num_predict": 300
            }
        )

        answer = response["message"]["content"].strip()

        if not answer:
            raise HTTPException(
                status_code=502,
                detail="The AI model returned an empty response."
            )

        return {"response": answer}

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chatbot error: {str(e)}"
        )
