import os
import json
import boto3

BUCKET = os.environ["BUCKET"]

s3_client = boto3.client("s3")


def lambda_handler(event, context):
    key = event["queryStringParameters"]["key"]

    url = s3_client.generate_presigned_url(
        "get_object", Params={"Bucket": BUCKET, "Key": key}, ExpiresIn=300
    )

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
        },
        "body": json.dumps(
            {
                "url": url,
            }
        ),
    }
