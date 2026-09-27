# DevStore — 3-Tier E-Commerce Application

A containerized 3-tier e-commerce/product management application built with React, Django REST Framework, MySQL, Nginx, and Docker.

The project demonstrates a practical 3-tier architecture and Docker-based deployment workflow.

---

## 🏗️ Architecture

```text
                    Internet
                       │
                       ▼
                ┌─────────────┐
                │   Nginx     │
                │   :80       │
                └──────┬──────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
       React Frontend      Django REST API
                            :8000
                               │
                               ▼
                         MySQL Database
                            :3306


  * Application flow



                        Browser
                           ↓
                         Nginx
                           ↓
                     React Frontend
                           ↓
                     /api/products/
                           ↓
                   Django REST Framework
                           ↓
                         MySQL


   ✨ Features

 -  Product management dashboard
 -  Add products
 -  Edit products
 -  Delete products
 -  Search products
 -  Product category filtering
 -  Stock management
 -  Inventory statistics
 -  REST API using Django REST Framework
 -  MySQL database
 -  Nginx reverse proxy
 -  Dockerized frontend and backend
 -  Docker Compose orchestration
 -  Environment-based configuration
 -  CORS configuration
 -  Persistent MySQL volume
 -  EC2 deployment ready



  🛠️ Tech Stack

    Frontend
    React
    Vite
    JavaScript
    CSS
    Backend
    Python
    Django
    Django REST Framework
    MySQL Client
    Database
    MySQL 8.4
    Infrastructure
    Docker
    Docker Compose
    Nginx
    AWS EC2
    Version Control
    Git
    GitHub


   📁 Project Structure

    devstore-3-tier-app/
    │
    ├── backand/
    │   ├── config/
    │   ├── products/
    │   ├── Dockerfile
    │   ├── .dockerignore
    │   ├── manage.py
    │   └── requirements.txt
    │
    ├── frontend/
    │   ├── src/
    │   ├── public/
    │   ├── Dockerfile
    │   ├── nginx.conf
    │   ├── .dockerignore
    │   ├── package.json
    │   └── vite.config.js
    │
    ├── docker-compose.yml
    ├── .env.example
    ├── .gitignore
    └── README.md


🚀 Getting Started

1. Clone the repository
git clone git@github.com:manvendra8830-rgb/devstore-3-tier-app.git



Or using HTTPS:
git clone https://github.com/manvendra8830-rgb/devstore-3-tier-app.git



Move into the project:
cd devstore-3-tier-app


2. Configure environment variables


Create the environment file:
cp .env.example .env


Open it:
nano .env



Configure the required values:

DB_NAME=devstore_db
DB_USER=devstore_user
DB_PASSWORD=change_me
DB_HOST=db
DB_PORT=3306

MYSQL_ROOT_PASSWORD=change_me

SECRET_KEY=change_me
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1



Never commit the .env file to GitHub.



       🐳 Run with Docker Compose

   Build and start all services:
   docker compose up -d --build
   Check running containers:
   docker compose ps


      Expected services:

  devstore-db
  devstore-backend
  devstore-frontend


  🌐 Access the application

   Open:
   http://localhost


The frontend is served by Nginx on port 80.

🔌 API


   The backend API is available through:

   /api/products/
   Get all products
   GET /api/products/
   Create product
   POST /api/products/


Example:

{
  "name": "AWS EC2 Server",
  "description": "Cloud server for DevOps testing",
  "category": "DevOps",
  "price": "5000",
  "stock": 10
}

Get a product
GET /api/products/<id>/
Update a product
PUT /api/products/<id>/
Delete a product
DELETE /api/products/<id>/



🗄️ Database

MySQL runs as a separate Docker container.

The database uses a persistent Docker volume:

mysql_data

This allows database data to survive container recreation.

🔧 Useful Docker Commands
Start services
docker compose up -d
Build containers
docker compose build
Rebuild and start
docker compose up -d --build
Stop services
docker compose stop
View containers
docker compose ps
View backend logs
docker compose logs backend
View frontend logs
docker compose logs frontend
View database logs
docker compose logs db
Follow backend logs
docker compose logs -f backend


🧩 Django Management Commands

Run migrations:

docker compose exec backend python manage.py migrate

Create a superuser:

docker compose exec backend python manage.py createsuperuser

Access Django shell:

docker compose exec backend python manage.py shell
☁️ AWS EC2 Deployment

The application can be deployed on an AWS EC2 instance using Docker Compose.



Basic deployment flow:

Developer
    │
    ▼
GitHub
    │
    ▼
AWS EC2
    │
    ▼
Docker Compose
    │
    ├── React + Nginx
    ├── Django REST API
    └── MySQL





On the EC2 instance:

git clone git@github.com:manvendra8830-rgb/devstore-3-tier-app.git

cd devstore-3-tier-app

cp .env.example .env

nano .env

docker compose up -d --build

For an EC2 deployment, configure ALLOWED_HOSTS according to the domain/IP you are using.



🔐 Security Notes

Do not commit sensitive information such as:

Database passwords
Django SECRET_KEY
AWS credentials
SSH private keys
API keys
Production secrets

Use:

.env

for local/private configuration.

Use:

.env.example

for safe configuration documentation.



📌 Future Improvements

Planned improvements include:

User authentication and authorization
Order management
Product image uploads
Pagination
Advanced product filtering
JWT authentication
Production WSGI server
HTTPS with SSL/TLS
CI/CD using GitHub Actions
Automated testing
Health checks
Monitoring and logging
AWS production deployment
Infrastructure automation
🎯 Project Purpose

This project was created to demonstrate a practical 3-tier application architecture while combining application development with DevOps concepts.

It covers:

Frontend development
REST API development
Database integration
Containerization
Reverse proxy configuration
Environment configuration
AWS EC2 deployment
Git/GitHub workflow
👨‍💻 Author

Manvendra Singh

GitHub:

https://github.com/manvendra8830-rgb

