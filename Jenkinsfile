pipeline {
  agent any
  parameters {
    choice(name: 'ENV', choices: ['dev', 'staging'], description: 'Environment file to use')
    choice(name: 'BROWSERS', choices: ['all', 'chromium', 'firefox', 'webkit'], description: 'Browser project(s)')
    string(name: 'WORKERS', defaultValue: '0', description: '0 lets Playwright decide; 1 = serial')
    booleanParam(name: 'HEADLESS', defaultValue: true, description: 'Run headless?')
    string(name: 'RETRIES', defaultValue: '0', description: 'Global retries')
  }
  options { timestamps() }

  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Setup Node') {
      steps {
        nodejs(nodeJSInstallationName: 'NodeJS_20') {
          sh 'npm ci'
          sh 'npx playwright install --with-deps'
        }
      }
    }
    stage('Test') {
      environment {
        ENV = "${params.ENV}"
        HEADLESS = "${params.HEADLESS}"
        PLAYWRIGHT_WORKERS = "${params.WORKERS}"
        RETRIES = "${params.RETRIES}"
        PROJECTS = "${params.BROWSERS}" == "all" ? "" : "${params.BROWSERS}"
      }
      steps {
        nodejs(nodeJSInstallationName: 'NodeJS_20') {
          sh '''
            if [ -z "$PROJECTS" ]; then
              npx playwright test
            else
              PROJECTS=$PROJECTS npx playwright test
            fi
          '''
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'playwright-report/**', fingerprint: true, allowEmptyArchive: true
          archiveArtifacts artifacts: 'allure-results/**', fingerprint: true, allowEmptyArchive: true
          sh 'npx allure generate ./allure-results -o ./allure-report --clean || true'
          archiveArtifacts artifacts: 'allure-report/**', fingerprint: true, allowEmptyArchive: true
        }
      }
    }
  }
}
