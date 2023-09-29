# General
import os
import json
import boto3

# Embedding
from typing import List
from langchain.embeddings import SagemakerEndpointEmbeddings
from langchain.embeddings.sagemaker_endpoint import EmbeddingsContentHandler

# LLM
from langchain.llms.sagemaker_endpoint import (
    LLMContentHandler,
    SagemakerEndpoint,
)
from langchain.chains.question_answering import load_qa_chain

# Vector Store
from langchain.vectorstores import OpenSearchVectorSearch

BUCKET_NAME = os.environ["BUCKET_NAME"]
OPENSEARCH_USERNAME = os.environ["OPENSEARCH_USERNAME"]
OPENSEARCH_PASSWORD = os.environ["OPENSEARCH_PASSWORD"]
OPENSEARCH_DOMAIN = os.environ["OPENSEARCH_DOMAIN"]
OPENSEARCH_INDEX = os.environ["OPENSEARCH_INDEX"]

CONNECTION_STRING = (
    f"https://{OPENSEARCH_USERNAME}:{OPENSEARCH_PASSWORD}@{OPENSEARCH_DOMAIN}"
)

s3 = boto3.client("s3")
comprehend = boto3.client("comprehend")
translate = boto3.client("translate")


class EmbeddingsEndpoint(SagemakerEndpointEmbeddings):
    def embed_documents(
        self, texts: List[str], chunk_size: int = 5
    ) -> List[List[float]]:
        results = []
        _chunk_size = len(texts) if chunk_size > len(texts) else chunk_size

        for i in range(0, len(texts), _chunk_size):
            response = self._embedding_func(texts[i : i + _chunk_size])
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


class LLMHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        input_str = json.dumps(
            {
                "inputs": [
                    [
                        {
                            "role": "system",
                            "content": "You are a chatbot, answer the question if you know.",
                        },
                        {"role": "user", "content": prompt},
                    ]
                ],
                "parameters": {**model_kwargs},
            }
        )
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json[0]["generation"]["content"]


def detect_question_language(question):
    languages = comprehend.detect_dominant_language(Text=question)

    return languages["Languages"][0]["LanguageCode"]


def lambda_handler(event, context):
    try:
        # Get the key and question
        key = event["queryStringParameters"]["key"]
        question = event["queryStringParameters"]["question"]

        # Embed prompt
        embeddings = EmbeddingsEndpoint(
            endpoint_name="jumpstart-dft-hf-textembedding-all-minilm-l6-v2",
            region_name="us-east-1",
            content_handler=EmbeddingsHandler(),
        )

        # Search by similarity
        vectordb = OpenSearchVectorSearch(
            opensearch_url=CONNECTION_STRING,
            index_name=OPENSEARCH_INDEX,
            embedding_function=embeddings,
            engine="lucene",
        )

        result_docs = vectordb.similarity_search(
            query=question,
            k=3,
            search_type="approximate_search",
            efficient_filter={
                "bool": {"filter": {"term": {"metadata.source": key}}}
            },
        )
        print(key)
        print(result_docs)

        # Ask LLM
        sm_llm = SagemakerEndpoint(
            endpoint_name="jumpstart-dft-meta-textgeneration-llama-2-70b-f",
            region_name="us-east-1",
            model_kwargs={
                "max_new_tokens": 2048,
                "top_p": 0.1,
                "temperature": 0.7,
            },
            content_handler=LLMHandler(),
            endpoint_kwargs={"CustomAttributes": "accept_eula=true"},
        )

        chain = load_qa_chain(llm=sm_llm, chain_type="stuff")
        answer = chain({"input_documents": result_docs, "question": question})

        answer["output_text"] = translate.translate_text(
            Text=answer["output_text"],
            SourceLanguageCode="auto",
            TargetLanguageCode=detect_question_language(question),
        )["TranslatedText"]

        pages = ""
        for document in answer["input_documents"]:
            pages = pages + str(document.metadata["page"]) + " "
        answer = f"{answer['output_text']} Pg.: {pages}."

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
            },
            "body": json.dumps({"answer": answer}),
        }
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
            },
            "body": json.dumps(
                {"answer": "Not possible to answer your question."}
            ),
        }
