# General
import os
import json
import boto3

# Embedding
from typing import List
from langchain.embeddings import SagemakerEndpointEmbeddings
from langchain.embeddings.sagemaker_endpoint import EmbeddingsContentHandler

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

s3 = boto3.client("s3")


class EmbeddingsEndpoint(SagemakerEndpointEmbeddings):
    def embed_documents(
        self, texts: List[str], chunk_size: int = 5
    ) -> List[List[float]]:
        results = []
        _chunk_size = len(texts) if chunk_size > len(texts) else chunk_size

        for i in range(0, len(texts), _chunk_size):
            response = self._embedding_func(texts[i : i + _chunk_size])
            print
            results.extend(response)

        return results


class EmbeddingsHandler(EmbeddingsContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs={}) -> bytes:
        input_str = json.dumps({"text_inputs": prompt, **model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        embeddings = response_json["embedding"]
        return embeddings


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
    embeddings = EmbeddingsEndpoint(
        endpoint_name="jumpstart-dft-hf-textembedding-all-minilm-l6-v2",
        region_name="us-east-1",
        content_handler=EmbeddingsHandler(),
    )

    # Store to OpenSearch
    OpenSearchVectorSearch.from_documents(
        documents=documents,
        opensearch_url=CONNECTION_STRING,
        index_name=OPENSEARCH_INDEX,
        embedding=embeddings,
        engine="lucene",
    )

    return {"statusCode": 200, "body": "PDF preprocess successful"}
