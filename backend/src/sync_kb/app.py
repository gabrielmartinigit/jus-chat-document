import os
import json
import boto3

KBID = os.environ["KBID"]
DSID = os.environ["DSID"]
bedrock = boto3.client('bedrock-agent')

def lambda_handler(event, context):
    response = bedrock.start_ingestion_job(
        knowledgeBaseId=KBID,
        dataSourceId=DSID
    )
    print(response)

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
        },
        "body": "Sync iniciado",
    }