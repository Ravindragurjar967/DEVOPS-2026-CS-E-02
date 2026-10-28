# Deploy E-Prescription Platform to Kubernetes
Write-Host "Deploying E-Prescription Platform to Kubernetes..." -ForegroundColor Cyan

kubectl apply -k (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "Waiting for pods to become ready..." -ForegroundColor Yellow
kubectl wait --namespace eprescription --for=condition=ready pod --selector=app=backend --timeout=90s
kubectl wait --namespace eprescription --for=condition=ready pod --selector=app=frontend --timeout=90s

Write-Host "`nDeployment Complete! Pods status:" -ForegroundColor Green
kubectl get pods -n eprescription -o wide

Write-Host "`nTo access the application locally in your browser, run:" -ForegroundColor Cyan
Write-Host "kubectl port-forward svc/frontend-service -n eprescription 8080:80" -ForegroundColor White
Write-Host "And open: http://localhost:8080`n" -ForegroundColor White
