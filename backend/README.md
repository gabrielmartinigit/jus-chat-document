# Backend API

## Build & Deploy

```bash
sam validate
sam build
sam deploy --parameter-overrides LLMMODELID=00000000 KBID=00000000 DSID=000000 BUCKET=000000 --stack-name chat-backend --resolve-s3 --resolve-image-repos --capabilities CAPABILITY_IAM
```

## Local test

```bash
sam local invoke AnswerQuestionFunction --env-vars ./env/vars.json --event ./events/chat.json
```

## References

- LangChain Amazon BedRock: https://python.langchain.com/docs/integrations/providers/bedrock
- LangChain Amazon SageMaker: https://python.langchain.com/docs/integrations/providers/sagemaker_endpoint
