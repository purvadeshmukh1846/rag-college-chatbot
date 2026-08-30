# College RAG Chatbot

An AI-powered college information assistant that answers student questions using Retrieval-Augmented Generation (RAG). Users upload college documents (PDFs), and the chatbot retrieves relevant information from them before generating accurate, source-backed answers.

## Problem Statement

Students often struggle to find specific information buried in long college documents like syllabi, notices, and FAQs. This chatbot solves that by letting users upload documents once and then ask natural-language questions, getting instant answers grounded in the actual document content — with no hallucinated information, since answers are always based on retrieved context.

## Features

- User authentication (register/login with JWT)
- PDF document upload and automatic text extraction
- Text chunking for efficient processing
- AI-generated embeddings for semantic search (Google Gemini)
- Retrieval-Augmented Generation pipeline — retrieves relevant document chunks before generating an answer
- Source display — shows which part of the document an answer came from
- Graceful handling of questions with no relevant context ("I don't have information about that")
- Real-time chat interface

## Technology Stack

**Frontend:** React (Vite), Axios
**Backend:** Node.js, Express
**Database:** MongoDB Atlas
**AI/Embeddings:** Google Gemini API (gemini-embedding-001 for embeddings, gemini-3.6-flash for chat)
**Authentication:** JWT, bcrypt
**File Handling:** Multer, pdf-parse
**Deployment:** Vercel (frontend), Render (backend)

## Live Demo

Frontend: https://rag-college-chatbot-six.vercel.app

## Backend

API: https://rag-college-chatbot-backend-nnjl.onrender.com

## Setup Instructions (Run Locally)

### Backend
