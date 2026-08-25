pipeline {
    agent any  // runs on any available Jenkins agent

    stages {
        stage('Checkout') {
            steps {
                // Pull code from Git (already handled by SCM configuration)
                checkout scm
            }
        }

        stage('Build') {
            steps {
                // Replace with your build command
                // Example for Maven:
                // sh 'mvn clean compile'
                // Example for Python:
                // sh 'pip install -r requirements.txt'
            }
        }

        stage('Test') {
            steps {
                // Replace with your test command
                // Example for Maven (JUnit):
                // sh 'mvn test'
                // Example for Python (pytest with JUnit output):
                // sh 'pytest --junitxml=test-results.xml'
            }
            post {
                always {
                    // Publish JUnit-style test results
                    junit '**/test-results.xml'
                }
            }
        }

        stage('Report') {
            steps {
                // If you have HTML reports, publish them
                // publishHTML ([
                //     reportDir: 'reports',
                //     reportFiles: 'index.html',
                //     reportName: 'Test Report'
                // ])
            }
        }
    }

    post {
        failure {
            // Send notifications (email, Slack, etc.) on failure
            // emailext (
            //     subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            //     body: "Check console output at ${env.BUILD_URL}",
            //     to: 'team@example.com'
            // )
        }
    }
}