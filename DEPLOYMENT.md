## AWS Lambda deployment

The backend is packaged by `template.yaml` as an Express application behind an
API Gateway HTTP API. The deployed base URL will be available as the
CloudFormation output `ApiUrl`; for example, the health check is
`https://<api-id>.execute-api.ap-south-1.amazonaws.com/health`.

### Prerequisites

- AWS CLI credentials with permissions for CloudFormation, Lambda, API Gateway,
	IAM role creation, and an S3 deployment bucket.
- MongoDB Atlas configured to allow the Lambda network access. Keep the Atlas
	URI out of git and use a least-privilege database user.
- A production `JWT_SECRET` with at least 32 characters.
- Razorpay, SMTP, and frontend origin values ready as deployment parameters.

### Recommended: AWS SAM CLI

From the repository root:

```powershell
sam build --template-file template.yaml
sam deploy --guided --template-file .aws-sam\build\template.yaml
```

When prompted, use `ap-south-1`, provide the values for every parameter, and
save the generated `samconfig.toml` locally. Do not commit that file if it
contains secret parameter values.

### AWS CLI only

If SAM CLI is unavailable, use an existing private S3 bucket owned by this
account:

```powershell
aws cloudformation package `
	--template-file template.yaml `
	--s3-bucket YOUR_PRIVATE_DEPLOYMENT_BUCKET `
	--output-template-file packaged.yaml `
	--region ap-south-1

aws cloudformation deploy `
	--template-file packaged.yaml `
	--stack-name sheinar-backend `
	--capabilities CAPABILITY_IAM `
	--parameter-overrides `
		MongoDbUri="YOUR_MONGODB_URI" `
		JwtSecret="YOUR_JWT_SECRET" `
		EmailUser="YOUR_EMAIL_USER" `
		EmailPass="YOUR_EMAIL_APP_PASSWORD" `
		RazorpayKeyId="YOUR_RAZORPAY_KEY_ID" `
		RazorpayKeySecret="YOUR_RAZORPAY_KEY_SECRET" `
		RazorpayWebhookSecret="YOUR_RAZORPAY_WEBHOOK_SECRET" `
		AllowedOrigins="https://your-store.example,https://your-admin.example" `
		FrontendUrl="https://your-store.example" `
	--region ap-south-1

aws cloudformation describe-stacks `
	--stack-name sheinar-backend `
	--query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" `
	--output text `
	--region ap-south-1
```

Use PowerShell environment variables or AWS Secrets Manager in CI instead of
putting real values in command history. The template marks secret parameters as
`NoEcho`, but Secrets Manager is the stronger long-term option.

### Frontend configuration

Set the API base URL used by both frontend applications to the `ApiUrl` output,
then redeploy the frontends. Include the frontend and admin HTTPS origins in
the `AllowedOrigins` parameter as a comma-separated list.

### Important Lambda behavior

MongoDB connections are cached between warm Lambda invocations. The existing
in-process cron jobs are intentionally not started in Lambda because Lambda
instances are ephemeral and can run concurrently. Move those jobs to separate
EventBridge schedules that invoke dedicated Lambda handlers before enabling
production abandoned-checkout or tracking automation.

### Cron deployment permissions

The deployment identity must also be allowed to manage EventBridge rules and
the Lambda permissions that let those rules invoke the functions:

```text
events:DescribeRule
events:PutRule
events:DeleteRule
events:EnableRule
events:DisableRule
events:PutTargets
events:RemoveTargets
lambda:AddPermission
lambda:RemovePermission
lambda:GetPolicy
iam:PassRole
```

The cron deployment requires `events:DescribeRule`. The two scheduled jobs are
defined in `template.yaml` as classic EventBridge rules: abandoned checkout
reminders every 10 minutes and shipment tracking every 30 minutes.

### Order confirmation email

Payment succeeds independently from email delivery, so a mail-provider failure
does not undo a paid order. Confirmation emails now retry three times and write
`sent` or `failed` records to the `Notification` collection. Check the Lambda
logs and admin notification log for delivery results.

For Gmail, enable 2-Step Verification on `EMAIL_USER`, create a Google App
Password, and use that 16-character value as `EMAIL_PASS`. Do not use the normal
Gmail account password. The current `535 Username and Password not accepted`
error means the deployed password is invalid or Gmail has rejected it.

For another SMTP provider, set `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`,
`EMAIL_USER`, and `EMAIL_PASS` in the deployment parameters. `EMAIL_SECURE=true`
is normally used with port `465`; use `false` with port `587` when using STARTTLS.
