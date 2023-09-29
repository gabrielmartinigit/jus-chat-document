# General
import os
import json
import boto3

# Embedding
from langchain.embeddings import BedrockEmbeddings

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

bedrock = boto3.client(
    "bedrock-runtime",
    endpoint_url="https://bedrock-runtime.us-east-1.amazonaws.com",
    region_name="us-east-1",
)


def get_doc_info(doc):
    document = {"source": "", "summary": ""}
    document["source"] = doc.metadata["source"]
    document["summary"] = doc.page_content

    return document


def lambda_handler(event, context):
    query = event["queryStringParameters"]["q"]

    # Embed
    embeddings = BedrockEmbeddings(client=bedrock, model_id=EMBEDDING_MODEL_ID)

    # Search by similarity
    vectordb = OpenSearchVectorSearch(
        opensearch_url=CONNECTION_STRING,
        index_name=OPENSEARCH_INDEX,
        embedding_function=embeddings,
        engine="faiss",
    )

    results = vectordb.similarity_search(
        query=query, k=10, search_type="approximate_search"
    )

    # Format result
    search_results = []
    for result in results:
        search_results.append(get_doc_info(result))

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
        },
        "body": json.dumps(
            {
                "results": search_results,
            }
        ),
    }
