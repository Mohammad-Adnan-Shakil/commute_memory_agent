# IAM Setup — memory_handler Lambda

Two files here, both ready to use as-is on deployment day (no edits needed unless you rename the Lambda or secret).

## 1. `lambda-trust-policy.json`
This is the **trust policy** — it tells AWS that the Lambda service itself is allowed to assume this role. Required for every Lambda execution role, boilerplate, don't need to touch it.

## 2. `lambda-permissions-policy.json`
This is the **permissions policy** — what the Lambda is actually allowed to do once it's running. Scoped to exactly two things, nothing more (least-privilege, matches hackathon judging criteria on production readiness):

- Write logs to CloudWatch (`/aws/lambda/memory_handler*`) — standard, needed for debugging
- Read one specific secret from Secrets Manager (`commute-memory-agent/cockroachdb-connection-*`) — this is how the Lambda gets the CockroachDB connection string **without** it being a plaintext environment variable

## Deployment steps (Aug 9+)

1. **Create the CockroachDB connection secret first:**
   ```bash
   aws secretsmanager create-secret \
     --name commute-memory-agent/cockroachdb-connection \
     --secret-string '{"connection_string":"<your real CockroachDB connection string>"}'
   ```

2. **Create the IAM role:**
   ```bash
   aws iam create-role \
     --role-name memory-handler-execution-role \
     --assume-role-policy-document file://lambda-trust-policy.json

   aws iam put-role-policy \
     --role-name memory-handler-execution-role \
     --policy-name memory-handler-permissions \
     --policy-document file://lambda-permissions-policy.json
   ```

3. **Deploy the Lambda** (from `aws_lambda/memory_handler.py`), attaching the role created above.

4. **Give API Gateway permission to invoke the Lambda** — this is a separate resource-based policy attached directly to the Lambda, not part of the execution role above:
   ```bash
   aws lambda add-permission \
     --function-name memory_handler \
     --statement-id apigateway-invoke \
     --action lambda:InvokeFunction \
     --principal apigateway.amazonaws.com \
     --source-arn "arn:aws:execute-api:<region>:<account-id>:<api-id>/*/*/*"
   ```
   (The `source-arn` gets filled in once the API Gateway is created — grab it from the console or CLI output.)

5. **Update `memory_handler.py`'s `_execute_query` function** to pull the connection string from Secrets Manager instead of using a stub:
   ```python
   import boto3
   import json as _json

   def _get_db_connection_string():
       client = boto3.client("secretsmanager")
       response = client.get_secret_value(SecretId="commute-memory-agent/cockroachdb-connection")
       return _json.loads(response["SecretString"])["connection_string"]
   ```

## Why Secrets Manager instead of a plain env var

A raw `.env` variable on Lambda is visible to anyone with read access to the function's configuration in the AWS console. Secrets Manager keeps the actual connection string out of the Lambda config entirely — the Lambda only holds a *reference* (the secret name), and IAM controls who/what can resolve it. This is a small but real point in the hackathon's "production readiness" judging criteria (resilience, access control).