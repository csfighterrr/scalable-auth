#!/bin/bash

# Docker Hub publish script for auth-service
# Usage: ./publish.sh <docker-hub-username> [version]

if [ -z "$1" ]; then
    echo "Usage: $0 <docker-hub-username> [version]"
    echo "Example: $0 johndoe 1.0.0"
    exit 1
fi

DOCKER_USERNAME=$1
VERSION=${2:-"latest"}
IMAGE_NAME="auth-service"

echo "Building Docker image..."
docker build -t ${IMAGE_NAME}:${VERSION} .

if [ $? -ne 0 ]; then
    echo "Failed to build Docker image"
    exit 1
fi

echo "Tagging image for Docker Hub..."
docker tag ${IMAGE_NAME}:${VERSION} ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
docker tag ${IMAGE_NAME}:${VERSION} ${DOCKER_USERNAME}/${IMAGE_NAME}:latest

echo "Pushing to Docker Hub..."
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:latest

echo "Successfully published ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} to Docker Hub!"
echo ""
echo "To use this image:"
echo "docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
echo "docker run -p 3000:3000 --env-file .env ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
