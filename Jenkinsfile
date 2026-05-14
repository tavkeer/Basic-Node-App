pipeline {
    agent any
    
    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO = '494003776090.dkr.ecr.ap-south-1.amazonaws.com'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                echo 'Pulling code from GitHub...'
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    sh """
                        docker build -t ${ECR_REPO}:${IMAGE_TAG} .
                        docker tag ${ECR_REPO}:${IMAGE_TAG} ${ECR_REPO}:latest
                    """
                }
            }
        }
        
        stage('Login to ECR') {
            steps {
                echo 'Logging into AWS ECR...'
                script {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REPO}
                    """
                }
            }
        }
        
        stage('Push to ECR') {
            steps {
                echo 'Pushing Docker image to ECR...'
                script {
                    sh """
                        docker push ${ECR_REPO}:${IMAGE_TAG}
                        docker push ${ECR_REPO}:latest
                    """
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                echo 'Cleaning up local images...'
                script {
                    sh """
                        docker rmi ${ECR_REPO}:${IMAGE_TAG} || true
                        docker rmi ${ECR_REPO}:latest || true
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs above.'
        }
    }
}
