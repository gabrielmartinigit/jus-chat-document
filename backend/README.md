# Backend API

## Build & Deploy

```bash
sam validate
sam build --use-container --no-cached
sam deploy --stack-name chat-document-backend --resolve-s3 --resolve-image-repos --capabilities CAPABILITY_IAM
```

## Local test

```bash
sam local invoke AnswerQuestionFunction --env-vars ./env/vars.json --event ./events/chat.json
```

## References

- LangChain Amazon BedRock: https://python.langchain.com/docs/integrations/providers/bedrock
- LangChain Amazon SageMaker: https://python.langchain.com/docs/integrations/providers/sagemaker_endpoint
