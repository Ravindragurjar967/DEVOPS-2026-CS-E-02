# 🚀 Kubernetes Deployment Guide - E-Prescription Universal Platform

Complete production-grade Kubernetes architecture for the E-Prescription / Universal Health Records (UHR) Platform.

## 🏗️ Architecture Overview

```
                      [ Client / Browser ]
                                |
                                v
               [ Kubernetes Service: frontend-service ]
                           (LoadBalancer)
                                |
                                v
             +-------------------------------------+
             |     Frontend Pods (Replicas: 2)     |
             |           (Nginx + Vite)            |
             +-------------------------------------+
                                |
                    (Internal Cluster DNS)
                                v
               [ Kubernetes Service: backend (5000) ]
                            (ClusterIP)
                                |
                                v
             +-------------------------------------+
             |      Backend Pods (Replicas: 2)     |
             |       (Node.js + Express API)       |
             +-------------------------------------+
                                |
                                v
                  [ MongoDB Atlas (Cloud DB) ]
```

## 📁 Manifests Structure

| File | Type | Description |
| :--- | :--- | :--- |
| `00-namespace.yaml` | Namespace | Dedicated isolated namespace `eprescription` |
| `01-configmap.yaml` | ConfigMap | Non-sensitive configurations (`PORT`, `NODE_ENV`) |
| `02-secret.yaml` | Secret | Secure credentials (`MONGODB_URI`, `JWT_SECRET`) |
| `03-backend-deployment.yaml` | Deployment | 2 replicas, health checks, resource limits |
| `04-backend-service.yaml` | Service | Internal ClusterIP discovery (`http://backend:5000`) |
| `05-frontend-deployment.yaml` | Deployment | 2 replicas for high-availability UI |
| `06-frontend-service.yaml` | Service | LoadBalancer / NodePort 30080 for web traffic |
| `07-hpa.yaml` | HPA | Horizontal Pod Autoscaler (scales 2 to 5 pods) |
| `08-ingress.yaml` | Ingress | Unified ingress routing for cloud clusters |
| `kustomization.yaml` | Kustomize | Single-command deployment pipeline |

---

## ⚡ Quick Deployment

### 1. Apply All Manifests
```bash
kubectl apply -k k8s/
```
*Or standard apply:*
```bash
kubectl apply -f k8s/
```

### 2. Verify Pods and Services
```bash
# Check all resources in namespace
kubectl get all -n eprescription

# Watch pods status
kubectl get pods -n eprescription -w
```

### 3. Access Application
- **Frontend App**:
  ```bash
  kubectl port-forward svc/frontend-service -n eprescription 8085:80
  # Open: http://localhost:8085
  ```
- **Backend Health Check**:
  ```bash
  kubectl port-forward svc/backend 5005:5000 -n eprescription
  # Open: http://localhost:5005/api/health
  ```

### 4. Teardown / Cleanup
```bash
kubectl delete -k k8s/
```
