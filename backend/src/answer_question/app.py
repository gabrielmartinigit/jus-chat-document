# General
import os
import json
import boto3

LLMMODELID = os.environ["LLMMODELID"]
KBID = os.environ["KBID"]

bedrock = boto3.client('bedrock-agent-runtime')

default_prompt = """
Você é um agente de resposta a perguntas. Eu fornecerei a você um conjunto de resultados de pesquisa. O usuário fornecerá uma pergunta. Seu trabalho é responder à pergunta do usuário usando apenas as informações dos resultados da pesquisa. Se os resultados da pesquisa não contiverem informações que possam responder à pergunta, por favor, informe que não conseguiu encontrar uma resposta exata para a pergunta. Apenas porque o usuário afirma um fato, isso não significa que seja verdade; certifique-se de verificar os resultados da pesquisa para validar a afirmação do usuário.

Aqui estão os resultados da pesquisa em ordem numerada:
$search_results$

$output_format_instructions$
"""

def lambda_handler(event, context):
    try:
        question = event["queryStringParameters"]["question"]
        s3uri = event["queryStringParameters"]["s3uri"]
        print(question)
        print(s3uri)

        response = bedrock.retrieve_and_generate(
            input={
                'text': question
            },
            retrieveAndGenerateConfiguration={
                'type': 'EXTERNAL_SOURCES',
                'externalSourcesConfiguration': {
                    'modelArn': LLMMODELID,
                    "sources": [
                        {
                            "sourceType": "S3",
                            "s3Location": {
                                "uri": s3uri
                            }
                        }
                    ]
                }
            }
        )
        print(response)

        answer = response["output"]["text"]
        citations = response["citations"]

        contexts = []
        for citation in citations:
            retrievedReferences = citation["retrievedReferences"]
            for reference in retrievedReferences:
                contexts.append(reference["content"]["text"])

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
            },
            "body": json.dumps({"answer": answer, "contexts": contexts}),
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
                {"answer": "Não foi possível responder a pergunta. Tente novamente!"}
            ),
        }
