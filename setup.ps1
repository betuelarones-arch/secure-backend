# Script de configuración para Windows
# Ejecutar como: .\setup.ps1

Write-Host "🚀 Iniciando configuración del proyecto..." -ForegroundColor Green

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar si PostgreSQL está instalado
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL instalado: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL no está instalado. Por favor instálalo desde https://www.postgresql.org/download/windows/" -ForegroundColor Red
    exit 1
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install

# Configurar .env si no existe
if (-not (Test-Path .env)) {
    Write-Host "📝 Creando archivo .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Recuerda editar .env con tus credenciales de PostgreSQL" -ForegroundColor Magenta
}

Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Edita el archivo .env y configura DATABASE_URL con tus credenciales"
Write-Host "2. Crea la base de datos: psql -U postgres -c 'CREATE DATABASE secure_db;'"
Write-Host "3. Ejecuta las migraciones: npx prisma migrate dev --name init"
Write-Host "4. (Opcional) Pobla la BD: node prisma/seed.js"
Write-Host "5. Inicia el servidor: npm run dev"
