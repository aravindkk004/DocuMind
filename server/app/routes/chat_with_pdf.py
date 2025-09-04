from flask import Blueprint, request, jsonify, current_app
import os
import math
import google.generativeai as genai
import time
from flask_cors import CORS, cross_origin

chat_with_pdf_bp = Blueprint('chat_with_pdf', __name__)

# Configure Gemini API once
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@chat_with_pdf_bp.route('/chat_with_pdf', methods=['POST'])
@cross_origin(supports_credentials=True)
def chat_with_pdf():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    session_id = data.get("session_id")
    question = data.get("question")

    if not session_id or not question:
        return jsonify({"error": "session_id and question are required"}), 400

    # Check session
    if session_id not in current_app.session_vectorstores:
        return jsonify({"error": "Session expired or invalid"}), 400
    
    # ✅ Refresh timestamp to keep session alive
    current_app.session_vectorstores[session_id]['timestamp'] = time.time()

    # Retrieve vectorstore from session
    vectorstore = current_app.session_vectorstores[session_id]["vectorstore"]

    # Calculate dynamic k
    total_chunks = vectorstore.index.ntotal
    print(total_chunks)
    if total_chunks <= 5:
        k = total_chunks
    else:
        k = min(10, max(5, math.ceil(total_chunks * 0.05)))

    # Retrieve top-k similar chunks
    scored_docs = vectorstore.similarity_search_with_score(question, k=k)
    threshold = 0.5
    filtered_docs_with_score = [(doc, score) for doc, score in scored_docs if score > threshold]
    filtered_docs_with_score.sort(key=lambda x: x[1], reverse=True)
    filtered_docs = [doc for doc, _ in filtered_docs_with_score]

    # Combine retrieved text
    retrieved_chunks = "\n".join([doc.page_content for doc in filtered_docs])

    print(retrieved_chunks)

    # Prepare Gemini prompt
    gemini_prompt = f"""
    You are an expert assistant helping users understand a PDF document.

    Use the following context from the document to answer the user’s question.
    Give answer always detailed.
    Do not use any information outside this context. Be precise and concise.

    Context:
    {retrieved_chunks}

    Question:
    {question}

    Answer:
    """

    # Start chat session
    chat_session = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config={
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        },
    ).start_chat(history=[])

    # Send prompt to Gemini
    response = chat_session.send_message(gemini_prompt)
    model_response = response.text

    return jsonify({'answer': model_response})
