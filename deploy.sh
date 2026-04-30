echo "Pre-build script"
echo "Authenticating with AWS ECR Repo"
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 607856468571.dkr.ecr.us-east-1.amazonaws.com

echo "Building Docker image"
docker build -t 607856468571.dkr.ecr.us-east-1.amazonaws.com/online-foodies-ui:latest .

echo "Pushing Docker image to ECR"
docker push 607856468571.dkr.ecr.us-east-1.amazonaws.com/online-foodies-ui:latest

