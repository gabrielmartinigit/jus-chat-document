# General
import json

# Embedding
from typing import List
from langchain.embeddings import SagemakerEndpointEmbeddings
from langchain.embeddings.sagemaker_endpoint import EmbeddingsContentHandler

# Vector Store
from langchain.vectorstores import OpenSearchVectorSearch

OPENSEARCH_USERNAME = "admin"
OPENSEARCH_PASSWORD = "Amazon_Web_Services_123"
OPENSEARCH_DOMAIN = f"https://{OPENSEARCH_USERNAME}:{OPENSEARCH_PASSWORD}@search-jus-domain-o4yxe4f3dx2g4xnn5x7yradww4.us-east-1.es.amazonaws.com"
OPENSEARCH_INDEX = "documents"


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


def get_doc_info(doc):
    document = {"source": "", "summary": ""}

    document["source"] = doc.metadata["source"]
    document["summary"] = doc.page_content

    return document


def lambda_handler(event, context):
    query = event["queryStringParameters"]["q"]

    # Embed prompt
    embeddings = EmbeddingsEndpoint(
        endpoint_name="jumpstart-dft-hf-textembedding-all-minilm-l6-v2",
        region_name="us-east-1",
        content_handler=EmbeddingsHandler(),
    )

    # Search by similarity
    vectordb = OpenSearchVectorSearch(
        opensearch_url=OPENSEARCH_DOMAIN,
        index_name=OPENSEARCH_INDEX,
        embedding_function=embeddings,
    )

    results = vectordb.similarity_search(
        query=query, k=10, search_type="script_scoring"
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
