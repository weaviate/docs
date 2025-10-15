---
title: Securing Weaviate with SSL/TLS
description: Learn the various techniques to secure your Weaviate deployment and go from Zero to Hero!
---

## Your Weaviate needs a bodyguard!

Let's imagine your Weaviate database as a high-security vault that contains your most valuable data treasures. When it's within your VPC, it's relatively safe from outside threats. But the moment you need to expose your vault to the outside world (the internet), it needs to be secured. 

Weaviate communicates through two ports, or doors if you will, port 8080(for HTTP) and port 50051 (for gRPC). Both doors need to be secured with encryption protocols in place.

That's exactly why it's important to secure your database using SSL/TLS. This guide will take you through three different options on securing your database. Whether you're a small startup or an enterprise giant - there's a solution for you!

Are you ready to embark on this security journey and turn your Weaviate database into an impenetrable digital fortress?

### When is SSL/TLS required?

#### There are some occasions where encryption is *optional:*

- **Co-located deployments:** Weaviate and your application are in the same protected environment. 
- **Internal-only access:** Your traffic never leaves the secure network perimeter.
- **Localhost development:** You are testing on a local machine. 

#### While in other occasions encryption is *required:*

Data transmitted over networks is vulnerable to interception. Network packets can be inspected at various points, exposing sensitive queries and vector data.

- **Internet-exposed deployments:** Weaviate accessible from external networks
- **Multi-network architectures:** Application and Weaviate on separate networks
- **Remote client connections:** Mobile apps, external services, or distributed systems

### Understanding Weaviate's dual-port architecture

Before we dive into implementation, it's important to understand that Weaviate requires **two separate endpoints**, both of which need SSL/TLS protection:

| **Port** | **Purpose** | **Protocol** |
|---|---|---|
| 8080 | Rest API and query interface | HTTP |
| 50051 | High-performance data operations | gRPC |

This dual-port requirement adds complexity compared to traditional single-port applications, as each endpoint needs its own domain/subdomain and SSL certificate.

### Your three paths to security: Choose your adventure

While the possibilities are endless for securing your vector database, this page will walk you through 3 approaches with varying levels of complexity and cost. 

### Path 1: Using Nginx

- **Complexity level:** Novice
- **Perfect for:** Small business, teams who prefer ClickOps, or personal projects.

What you'll need:

- A VPS or server with a public IP address
- A registered domain name with DNS management access
- Docker and Docker Compose installed
- Basic command-line knowledge

#### Step 1: Configure your DNS

1. Before requesting SSL certificates, configure your DNS records:

```
A Record:    weaviate.yourdomain.com    → Your-Server-IP
A Record:    grpc.yourdomain.com        → Your-Server-IP
```

:::tip
Use a wildcard DNS record (`*.yourdomain.com`) for easier subdomain management.
:::

Make sure to wait for DNS propagation before proceeding. 

#### Step 2: Deploy Weaviate

1. Create a directory for your project:

```bash
mkdir ~/weaviate-ssl
cd ~/weaviate-ssl
```

2. Create a `docker-compose.yml` file for Weaviate.


```yaml
---
services:
  weaviate:
    image: cr.weaviate.io/semitechnologies/weaviate:1.33.0
    container_name: weaviate
    ports:
      - 8080:8080
      - 50051:50051
    restart: unless-stopped
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'none'
      CLUSTER_HOSTNAME: 'node1'
    volumes:
      - weaviate_data:/var/lib/weaviate

volumes:
  weaviate_data:
```

3. Start Weaviate:

```bash
docker-compose up -d
```

4. Verify that it's running:

```bash
#This should return Weaviate metadata
curl http://localhost:8080/v1/meta
```


#### Step 3: Install Nginx Proxy Manager

1. Create a separate directory:

```bash
mkdir ~/nginx-proxy-manager
cd ~/nginx-proxy-manager
```

2. Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - '80:80'      # HTTP
      - '81:81'      # Admin UI
      - '443:443'    # HTTPS
    environment:
      DB_SQLITE_FILE: "/data/database.sqlite"
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
```

3. Start Nginx Proxy Manager

```bash
docker-compose up -d
```

#### Step 4: Access the admin interface

1. Navigate to `http://your-server-ip:81`

**Default credentials**
```
Email:    admin@example.com
Password: changeme
```

:::danger
Change these credentials **immediately** after first login!
:::

#### Step 5: Secure the HTTP endpoint


:::tip

<details>
<summary>Docker networking</summary>

 If Nginx Proxy Manager and Weaviate are in separate Docker Compose files, they need to communicate. 
 Either:
1. Use the Weaviate container name: `weaviate` (if on the same Docker network)
or
2. Create a shared network:

```bash
docker network create weaviate-network
``` 
then add both to compose files:
```yaml
networks:
  weaviate-network:
    external: true
```
and update the Forward Hostname/IP to `weaviate`

</details>
:::

1. Click **Hosts** -> **Proxy hosts** -> **Add proxy host**

#### Details Tab

| **Field** | **Value** |
|---|---|
| Domain names | `weaviate.yourdomain.com` |
| Scheme | `http` |
| Forward Hostname/IP | `localhost` (or container IP) |
| Forward Port | `8080` |
| Cache Assets | ✅ Checked |
| Block Common Exploits | ✅ Checked |
| Websockets Support | ✅ Checked |

#### SSL Tab

| **Field** | **Value** |
|---|---|
| SSL Certificate | Request a new SSL Certificate |
| Force SSL | ✅ Checked |
| HTTP/2 Support | ✅ Checked |
| HSTS Enabled | ✅ Checked |
| Email Address | `your-email@example.com` |

2. Agree to the TOS.
3. Click Save and wait 30-60 seconds for certificate provisioning.

#### Step 6: Secure the gRPC endpoints

1. Create a second proxy host for gRPC:

**Details tab**

| **Field** | **Value** |
|---|---|
| Domain Names | `grpc.yourdomain.com` |
| Scheme | `http` |
| Forward Hostname/IP | `localhost` |
| Forward Port | `50051` |
| Block Common Exploits | ✅ Checked |
| Websockets Support | ✅ Checked |

**SSL Tab**
Configure SSL the same way as the [HTTP endpoint](#ssl-tab)

#### Advanced Tab (*Critical for gRPC*)

Add this custom Nginx configuration:

```nginx
grpc_pass grpc://localhost:50051;
grpc_set_header Host $host;
```
Click **Save.**

#### Step 7: Test your secure connection

#### Test from command line

```bash
# Test HTTP endpoint
curl https://weaviate.yourdomain.com/v1/meta

# Verify SSL certificate
openssl s_client -connect weaviate.yourdomain.com:443 -servername weaviate.yourdomain.com < /dev/null
```

#### Test with Python client
```python
import weaviate

# Connect to SSL-secured Weaviate
client = weaviate.connect_to_custom(
    http_host="weaviate.yourdomain.com",
    http_port=443,
    http_secure=True,
    grpc_host="grpc.yourdomain.com",
    grpc_port=443,
    grpc_secure=True
)

# Verify connection
print(f"✅ Connected: {client.is_ready()}")

client.close()
```
[Troubleshooting Path 1](#path-1)

### Path 2: Using Traefik and Docker

- **Complexity level:** Intermediate
- **Perfect for:** Those devs who love automation, growing companies, and container-based infrastructure.

This method introduces Infrastructure as Code (IaC) principles while remaining manageable, Traefik was built specifically for containerized environments. This approach is the perfect intermediary between the GUI of Path 1 and the pure Kubernetes of Path 3. You can think of this as the progression of learning another language, Path 1 was like using Duolingo or using a translation app, Path 2 is learning to speak the language without the use of a translation app, and Path 3 is becoming fluent. 

What you'll need:

- Docker and Docker compose installed
- Domain name with DNS configured
- Understanding of Docker networking
- Familiarity with YAML configuration

#### Step 1: Prepare your environment

```bash
# Create Docker network
docker network create traefik-network

# Create project directory
mkdir -p ~/weaviate-traefik/{traefik,letsencrypt}
cd ~/weaviate-traefik
```

#### Step 2: Configure Traefik

1. Create `traefik/traefik.yml`:

```yaml
api:
  dashboard: true
  insecure: false

# Entry points (ports)
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: letsencrypt

# Let's Encrypt configuration
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

# Docker provider
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik-network

log:
  level: INFO
```

#### Step 3: Create Docker Compose configuration

1. Create `docker-compose.yml`:

```yaml
version: '3.8'

networks:
  traefik-network:
    external: true

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/traefik.yml:/traefik.yml:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - traefik-network
    labels:
      - "traefik.enable=true"

  weaviate:
    image: cr.weaviate.io/semitechnologies/weaviate:1.33.0  # ✅ Consistent versioning
    container_name: weaviate
    restart: unless-stopped
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'none'
      CLUSTER_HOSTNAME: 'node1'
    volumes:
      - weaviate_data:/var/lib/weaviate
    networks:
      - traefik-network
    labels:
      - "traefik.enable=true"
      
      # HTTP/REST API endpoint
      - "traefik.http.routers.weaviate-http.rule=Host(`weaviate.yourdomain.com`)"
      - "traefik.http.routers.weaviate-http.entrypoints=websecure"
      - "traefik.http.routers.weaviate-http.tls.certresolver=letsencrypt"
      - "traefik.http.routers.weaviate-http.service=weaviate-http"
      - "traefik.http.services.weaviate-http.loadbalancer.server.port=8080"
      
      # gRPC endpoint
      - "traefik.http.routers.weaviate-grpc.rule=Host(`grpc.yourdomain.com`)"
      - "traefik.http.routers.weaviate-grpc.entrypoints=websecure"
      - "traefik.http.routers.weaviate-grpc.tls.certresolver=letsencrypt"
      - "traefik.http.routers.weaviate-grpc.service=weaviate-grpc"
      - "traefik.http.services.weaviate-grpc.loadbalancer.server.port=50051"
      - "traefik.http.services.weaviate-grpc.loadbalancer.server.scheme=h2c"  # Enables HTTP/2 Cleartext for gRPC

volumes:
  weaviate_data:
```

:::tip
Don't forget to replace `yourdomain.com` with your actual domain!
:::


#### Step 4: Set permissions and deploy

Before deploying, configure your DNS records to point to your server:
```
A Record:    weaviate.yourdomain.com    → Your-Server-IP
A Record:    grpc.yourdomain.com        → Your-Server-IP
```

The DNS propagation can take from 5-60 minutes, verify with:

```bash
dig weaviate.yourdomain.com
dig grpc.yourdomain.com
```

Wait for the DNS propagation before starting the services to ensure that Let's Encrypt can validate your domain.

```bash
# Set correct permissions for Let's Encrypt storage
touch ./letsencrypt/acme.json
chmod 600 ./letsencrypt/acme.json

# Start services
docker-compose up -d

# Monitor certificate acquisition
docker-compose logs -f traefik
```

Be sure to check for  messages indicating successful certificate issuance.

#### Step 5: Verify your deployment

```bash
# Check running containers
docker-compose ps

# View certificates in acme.json
cat ./letsencrypt/acme.json | jq '.letsencrypt.Certificates[].domain'

# Test HTTP endpoint
curl https://weaviate.yourdomain.com/v1/meta

# Verify SSL certificate
openssl s_client -connect weaviate.yourdomain.com:443 -servername weaviate.yourdomain.com < /dev/null 2>/dev/null | grep "Verify return code"
```

#### Step 6: Connect with your application

```python
import weaviate

client = weaviate.connect_to_custom(
    http_host="weaviate.yourdomain.com",
    http_port=443,
    http_secure=True,
    grpc_host="grpc.yourdomain.com",
    grpc_port=443,
    grpc_secure=True
)

try:
    print(f"✅ Connected: {client.is_ready()}")
    
    # Test basic operation
    collections = client.collections.list_all()
    print(f"Collections: {collections}")
finally:
    client.close()
```

[Troubleshooting Path 2](#path-2)

### Path 3: Using Kubernetes and Cert-Manager

- **Complexity level:** Advanced
- **Perfect for:** Scalable applications, production environments, and large enterprises.

What you'll need: 

- Running Kubernetes cluster
- kubectl configured with cluster access
- Helm 3 installed
- Domain with ability to update DNS to LoadBalancer IP
- Strong Kubernetes knowledge

#### Step 1: Verify cluster access

```bash
# Check cluster info
kubectl cluster-info

# Verify you have proper permissions
kubectl auth can-i create namespace

# Check cluster version
kubectl version --short
```

#### Step 2: Install Cert-Manager

```bash
# Install Cert-Manager CRDs and controller
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods --namespace cert-manager

# Wait for all pods to be ready (may take 1-2 minutes)
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/instance=cert-manager \
  -n cert-manager \
  --timeout=300s
```

The expected output of this:
```
✅ cert-manager-xxxxxxxxx-xxxxx        1/1     Running
✅ cert-manager-cainjector-xxxxxxxxx-xxxxx   1/1     Running
✅ cert-manager-webhook-xxxxxxxxx-xxxxx      1/1     Running
```

#### Step 3: Install Traefik Ingress Controller

:::tip 
Before proceeding with installation, configure your DNS records:
 
```
A Record:    weaviate.yourdomain.com    → [Pending LoadBalancer IP]
A Record:    grpc.yourdomain.com        → [Pending LoadBalancer IP]
```

You'll update these with the actual LoadBalancer IP after Step 3. DNS propagation can take 5-60 minutes, so configure these early.
:::

1. Install Traefik:

```bash
# Add Traefik Helm repository
helm repo add traefik https://traefik.github.io/charts
helm repo update

# Create namespace
kubectl create namespace traefik

# Install Traefik with HTTPS redirect enabled
helm install traefik traefik/traefik \
  --namespace traefik \
  --set ports.web.redirectTo=websecure \
  --set ports.websecure.tls.enabled=true

# Verify installation
kubectl get pods -n traefik
kubectl get svc -n traefik

# Get LoadBalancer IP (may take 1-5 minutes)
kubectl get svc -n traefik traefik -w
```

:::warning
Stop! Update your DNS records to point ot the LoadBalancer IP before continuing!
:::

#### Step 4: Create Let's Encrypt ClusterIssuer

1. Create `letsencrypt-issuer.yaml`:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    # Let's Encrypt production server
    server: https://acme-v02.api.letsencrypt.org/directory
    
    # Email for renewal and security notices
    email: your-email@example.com
    
    # Secret to store ACME account private key
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    
    # HTTP-01 challenge
    solvers:
    - http01:
        ingress:
          class: traefik
```

2. Apply the issuer

```bash
kubectl apply -f letsencrypt-issuer.yaml

# Verify issuer is ready
kubectl get clusterissuer
kubectl describe clusterissuer letsencrypt-prod
```

#### Step 5: Deploy Weaviate

1. Create `weaviate-deployment.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: weaviate

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: weaviate-data
  namespace: weaviate
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: weaviate
  namespace: weaviate
  labels:
    app: weaviate
spec:
  replicas: 1
  selector:
    matchLabels:
      app: weaviate
  template:
    metadata:
      labels:
        app: weaviate
    spec:
      containers:
      - name: weaviate
        image: semitechnologies/weaviate:latest
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 50051
          name: grpc
        env:
        - name: QUERY_DEFAULTS_LIMIT
          value: "25"
        - name: AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED
          value: "true"
        - name: PERSISTENCE_DATA_PATH
          value: "/var/lib/weaviate"
        - name: DEFAULT_VECTORIZER_MODULE
          value: "none"
        - name: CLUSTER_HOSTNAME
          value: "node1"
        volumeMounts:
        - name: weaviate-data
          mountPath: /var/lib/weaviate
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /v1/.well-known/live
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /v1/.well-known/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
      volumes:
      - name: weaviate-data
        persistentVolumeClaim:
          claimName: weaviate-data

---
apiVersion: v1
kind: Service
metadata:
  name: weaviate
  namespace: weaviate
  labels:
    app: weaviate
spec:
  type: ClusterIP
  ports:
  - port: 8080
    targetPort: 8080
    name: http
  - port: 50051
    targetPort: 50051
    name: grpc
  selector:
    app: weaviate
```

2. Deploy Weaviate:

```bash
kubectl apply -f weaviate-deployment.yaml

# Verify deployment
kubectl get pods -n weaviate
kubectl get svc -n weaviate

# Wait for pod to be ready
kubectl wait --for=condition=ready pod \
  -l app=weaviate \
  -n weaviate \
  --timeout=300s

# Check logs
kubectl logs -n weaviate -l app=weaviate --tail=50
```

#### Step 6: Create Ingress with TLS

1. Create weaviate-ingressroute.yaml:

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: weaviate-http-cert
  namespace: weaviate
spec:
  secretName: weaviate-http-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - weaviate.yourdomain.com

---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: weaviate-grpc-cert
  namespace: weaviate
spec:
  secretName: weaviate-grpc-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - grpc.yourdomain.com

---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: weaviate-http
  namespace: weaviate
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`weaviate.yourdomain.com`)
      kind: Rule
      services:
        - name: weaviate
          port: 8080
  tls:
    secretName: weaviate-http-tls

---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: weaviate-grpc
  namespace: weaviate
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`grpc.yourdomain.com`)
      kind: Rule
      services:
        - name: weaviate
          port: 50051
          scheme: h2c  # HTTP/2 Cleartext for gRPC
  tls:
    secretName: weaviate-grpc-tls
```

2. Apply the configuration:

```bash
kubectl apply -f weaviate-ingressroute.yaml

# Verify IngressRoute creation
kubectl get ingressroute -n weaviate

# Watch certificate status
kubectl get certificate -n weaviate -w

# Verify certificates are issued
kubectl describe certificate weaviate-http-cert -n weaviate
kubectl describe certificate weaviate-grpc-cert -n weaviate
```

#### Step 7: Verify your SSL certificates

```bash
# Check certificate details
kubectl describe certificate weaviate-http-tls -n weaviate

# View the actual certificate
kubectl get secret weaviate-http-tls -n weaviate -o jsonpath='{.data.tls\.crt}' | \
  base64 -d | \
  openssl x509 -text -noout

# Check expiration date
kubectl get secret weaviate-http-tls -n weaviate -o jsonpath='{.data.tls\.crt}' | \
  base64 -d | \
  openssl x509 -noout -enddate
```

#### Test your secure Weaviate

```python
import weaviate

# Connect to Kubernetes-hosted Weaviate
client = weaviate.connect_to_custom(
    http_host="weaviate.yourdomain.com",
    http_port=443,
    http_secure=True,
    grpc_host="grpc.yourdomain.com",
    grpc_port=443,
    grpc_secure=True
)

try:
    print(f"✅ Connected: {client.is_ready()}")
    
    # Get metadata
    meta = client.get_meta()
    print(f"Weaviate version: {meta.get('version')}")
    
finally:
    client.close()
```

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback />
