pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo "Cloning repository..."
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo "Building the project..."
                // Use `bat` for Windows commands
                bat 'echo Build step completed'
                // Example for Maven on Windows:
                // bat 'mvn clean compile'
                // Example for Node.js:
                // bat 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo "Running tests..."
                bat 'echo Test step completed'
                // Example for Maven:
                // bat 'mvn test'
                // Example for Python:
                // bat 'pytest --junitxml=test-results.xml'
            }
            post {
                always {
                    echo "Test report step completed"
                    // junit '**/test-results.xml'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying application..."
                bat 'echo Deploy step completed'
            }
        }
    }

    post {
        failure {
            echo "Pipeline failed! Sending notification..."
            // Send email, Slack, etc.
        }
        success {
            echo "Pipeline succeeded!"
        }
    }
}