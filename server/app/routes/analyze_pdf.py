from flask import Blueprint, request, jsonify, current_app
import pdfplumber
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from langchain.embeddings import HuggingFaceEmbeddings
import os
import uuid
import time

analyze_pdf_bp = Blueprint('analyze_pdf', __name__)
# VECTORSTORE_DIR = "vectorstore"

# In-memory store for session vectorstores
session_vectorstores = {}


def extract_text_from_pdf(pdf_path):
    full_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"  # keep line breaks
    return full_text



def split_into_chunks(pdf_text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,       # tokens per chunk
        chunk_overlap=100,    # overlap between chunks
        length_function=len   # using simple character length; can adjust for tokens if needed
    )

    # Split extracted PDF text into chunks
    return text_splitter.split_text(pdf_text)



def vectorize_and_save(chunks):
    # Wrap your SentenceTransformer model
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    # Wrap chunks as Document objects
    docs = [Document(page_content=chunk) for chunk in chunks]
    # Create FAISS vectorstore
    vectorstore = FAISS.from_documents(docs, embedding_model)

    # Save FAISS index
    # os.makedirs(VECTORSTORE_DIR, exist_ok=True)
    # vectorstore.save_local(VECTORSTORE_DIR)

    return vectorstore


@analyze_pdf_bp.route('/analyze_pdf', methods=['POST'])
def analyze_pdf():
    # getting data from frontend
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    pdf_file = request.files['file']
    if pdf_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not pdf_file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Invalid file type. Only PDF allowed.'}), 400
    
    # extracting text from pdf 
    pdf_text = extract_text_from_pdf(pdf_file)

    # split into chunks 
    chunks = split_into_chunks(pdf_text)

    # Vectorize and save FAISS index
    vectorstore = vectorize_and_save(chunks)

    session_id = str(uuid.uuid4())
    # Store vectorstore with timestamp for cleanup
    current_app.session_vectorstores[session_id] = {
        "vectorstore": vectorstore,
        "timestamp": time.time()
    }

    # Return session ID to frontend
    return jsonify({
        "status": "success",
        "message": "PDF analyzed successfully.",
        "session_id": session_id
    })