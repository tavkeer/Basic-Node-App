pipeline {
    agent any
    
    environment {
        AWS_REGION = 'ap-south-1'  // Change to your AWS region
        ECR_REPO = '471112982355.dkr.ecr.ap-south-1.amazonaws.com/node-mongo-app'  // Your ECR URI
        IMAGE_TAG = "${BUILD_NUMBER}"
        PROD_SERVER = '13.127.161.60'  // Production server PRIVATE IP
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                echo '========================================='
                echo 'Stage 1: Pulling code from GitHub...'
                echo '========================================='
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '========================================='
                echo 'Stage 2: Building Docker image...'
                echo '========================================='
                script {
                    sh """
                        docker build -t ${ECR_REPO}:${IMAGE_TAG} .
                        docker tag ${ECR_REPO}:${IMAGE_TAG} ${ECR_REPO}:latest
                    """
                }
                echo "✓ Built image: ${ECR_REPO}:${IMAGE_TAG}"
            }
        }
        
        stage('Login to ECR') {
            steps {
                echo '========================================='
                echo 'Stage 3: Logging into AWS ECR...'
                echo '========================================='
                script {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REPO}
                    """
                }
                echo '✓ Successfully logged into ECR'
            }
        }
        
        stage('Push to ECR') {
            steps {
                echo '========================================='
                echo 'Stage 4: Pushing Docker image to ECR...'
                echo '========================================='
                script {
                    sh """
                        docker push ${ECR_REPO}:${IMAGE_TAG}
                        docker push ${ECR_REPO}:latest
                    """
                }
                echo "✓ Pushed image with tags: ${IMAGE_TAG} and latest"
            }
        }
        
        stage('Deploy to Production') {
            steps {
                echo '========================================='
                echo 'Stage 5: Deploying to Production Server...'
                echo '========================================='
                script {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${PROD_SERVER} '~/deploy.sh'
                    """
                }
                echo '✓ Application deployed successfully on production'
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '========================================='
                echo 'Stage 6: Verifying deployment...'
                echo '========================================='
                script {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${PROD_SERVER} 'docker ps | grep node-app'
                    """
                }
                echo '✓ Container is running on production server'
            }
        }
        
        stage('Cleanup') {
            steps {
                echo '========================================='
                echo 'Stage 7: Cleaning up local images...'
                echo '========================================='
                script {
                    sh """
                        docker rmi ${ECR_REPO}:${IMAGE_TAG} || true
                        docker rmi ${ECR_REPO}:latest || true
                    """
                }
                echo '✓ Cleanup completed'
            }
        }
    }
    
    post {
        success {
            echo '========================================='
            echo '✓✓✓ PIPELINE COMPLETED SUCCESSFULLY! ✓✓✓'
            echo '========================================='
            echo "Build Number: ${BUILD_NUMBER}"
            echo "Image Tag: ${IMAGE_TAG}"
            echo "ECR Repository: ${ECR_REPO}"
            echo "Deployed to: ${PROD_SERVER}"
            echo '========================================='
        }
        failure {
            echo '========================================='
            echo '✗✗✗ PIPELINE FAILED ✗✗✗'
            echo '========================================='
            echo 'Check the logs above for error details'
            echo '========================================='
        }
    }
}
