# General
import os
import json
import boto3

# Embedding
from langchain.embeddings import BedrockEmbeddings

# PDF Loader
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter

# Vector Store
from langchain.vectorstores import OpenSearchVectorSearch


OPENSEARCH_USERNAME = os.environ["OPENSEARCH_USERNAME"]
OPENSEARCH_PASSWORD = os.environ["OPENSEARCH_PASSWORD"]
OPENSEARCH_DOMAIN = os.environ["OPENSEARCH_DOMAIN"]
OPENSEARCH_INDEX = os.environ["OPENSEARCH_INDEX"]

CONNECTION_STRING = (
    f"https://{OPENSEARCH_USERNAME}:{OPENSEARCH_PASSWORD}@{OPENSEARCH_DOMAIN}"
)

EMBEDDING_MODEL_ID = os.environ["EMBEDDING_MODEL_ID"]

s3 = boto3.client("s3")
bedrock = boto3.client(
    "bedrock-runtime",
    endpoint_url="https://bedrock-runtime.us-east-1.amazonaws.com",
    region_name="us-east-1",
)


def lambda_handler(event, context):
    # Get the bucket and key from the S3 event
    bucket = event["Records"][0]["s3"]["bucket"]["name"]
    key = event["Records"][0]["s3"]["object"]["key"]

    # Download the PDF file from S3 to a temporary location
    temp_pdf_path = os.path.join("/tmp", "temp.pdf")
    s3.download_file(bucket, key, temp_pdf_path)

    # Load PDF
    loader = PyPDFLoader(temp_pdf_path)
    documents = loader.load()
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    documents = text_splitter.split_documents(documents)
    for document in documents:
        document.metadata["source"] = f"{bucket}/{key}"

    # Embed
    embeddings = BedrockEmbeddings(client=bedrock, model_id=EMBEDDING_MODEL_ID)

    # Store to OpenSearch
    OpenSearchVectorSearch.from_documents(
        documents=documents,
        opensearch_url=CONNECTION_STRING,
        index_name=OPENSEARCH_INDEX,
        embedding=embeddings,
        engine="faiss",
    )

    return {"statusCode": 200, "body": "PDF preprocess successful"}
