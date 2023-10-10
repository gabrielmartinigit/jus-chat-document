# General
import os
import json
import boto3

# Embedding
from langchain.embeddings import BedrockEmbeddings

# LLM
from langchain.llms import Bedrock
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

LLM_MODEL_ID = os.environ["LLM_MODEL_ID"]
EMBEDDING_MODEL_ID = os.environ["EMBEDDING_MODEL_ID"]

s3 = boto3.client("s3")
comprehend = boto3.client("comprehend")
translate = boto3.client("translate")
bedrock = boto3.client(
    "bedrock-runtime",
    endpoint_url="https://bedrock-runtime.us-east-1.amazonaws.com",
    region_name="us-east-1",
)


def detect_question_language(question):
    languages = comprehend.detect_dominant_language(Text=question)

    return languages["Languages"][0]["LanguageCode"]


def lambda_handler(event, context):
    try:
        # Get the key and question
        key = event["queryStringParameters"]["key"]
        question = event["queryStringParameters"]["question"]

        # Embed
        embeddings = BedrockEmbeddings(
            client=bedrock, model_id=EMBEDDING_MODEL_ID
        )

        # Search by similarity
        vectordb = OpenSearchVectorSearch(
            opensearch_url=CONNECTION_STRING,
            index_name=OPENSEARCH_INDEX,
            embedding_function=embeddings,
            engine="faiss",
        )

        result_docs = vectordb.similarity_search(
            query=question,
            k=15,
            efficient_filter={
                "bool": {
                    "should": [
                        {
                            "match_phrase": {
                                "metadata.source": key.replace(".pdf", "")
                            }
                        },
                        {"match_phrase": {"metadata.source": key}},
                    ]
                }
            },
        )

        print(key)
        print(result_docs)

        # Ask LLM
        llm = Bedrock(
            model_id=LLM_MODEL_ID,
            model_kwargs={
                "max_tokens_to_sample": 1000,
                "temperature": 0.5,
                "top_p": 0.7,
            },
            client=bedrock,
        )

        chain = load_qa_chain(llm=llm, chain_type="stuff")
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
