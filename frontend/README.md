# Frontend SPA

## Run local

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

## Deploy

```bash
aws cloudformation create-stack --stack-name chat-frontend --template-body file://template.yaml
aws cloudformation wait stack-create-complete --stack-name chat-frontend
bucket_name=$(aws cloudformation describe-stacks --stack-name chat-frontend --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' --output text)
cloudfront_id=$(aws cloudformation describe-stacks --stack-name chat-frontend --query 'Stacks[0].Outputs[?OutputKey==`CFDistributionID`].OutputValue' --output text)
cloudfront_name=$(aws cloudformation describe-stacks --stack-name chat-frontend --query 'Stacks[0].Outputs[?OutputKey==`CFDistributionName`].OutputValue' --output text)
aws s3 sync ./build s3://$bucket_name
aws cloudfront create-invalidation --distribution-id $cloudfront_id --paths "/*"
echo Access the page $cloudfront_name
```
