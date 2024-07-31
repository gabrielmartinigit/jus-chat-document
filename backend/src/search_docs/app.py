import os
import json
import boto3

KBID = os.environ["KBID"]
bedrock = boto3.client('bedrock-agent-runtime')

def get_doc_info(doc):
    document = {"source": "", "content": "", "score": ""}
    document["source"] = doc["location"]["s3Location"]
    document["content"] = doc["content"]["text"]
    document["score"] = doc["score"]

    return document

def lambda_handler(event, context):
    query = event["queryStringParameters"]["q"]

    results = bedrock.retrieve(
        knowledgeBaseId=KBID,
        retrievalConfiguration={
            "vectorSearchConfiguration": {
                "numberOfResults": 50,
            }
        },
        retrievalQuery={"text": query},
    )    

    # Format result
    search_results = []
    for result in results["retrievalResults"]:
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
