#!/usr/bin/env pwsh

# Bitespeed Identity Reconciliation System - Render Deployment Script
# This script helps prepare and deploy your app to Render.com

Write-Host "🚀 Bitespeed Identity Reconciliation System - Render Deployment" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if all required files exist
$requiredFiles = @("render.yaml", "src/app.ts", "prisma/schema.prisma", "package.json")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    exit 1
}

Write-Host "✅ All required files found" -ForegroundColor Green

# Check git status
Write-Host "`n📋 Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Yellow
    $commit = Read-Host "Do you want to commit these changes? (y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        git add .
        $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
        if (-not $commitMessage) {
            $commitMessage = "Prepare for Render deployment"
        }
        git commit -m $commitMessage
        git push origin main
        Write-Host "✅ Changes committed and pushed" -ForegroundColor Green
    }
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}

# Test local build
Write-Host "`n🔨 Testing local build..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Local build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Local build failed. Please fix the issues before deploying." -ForegroundColor Red
    exit 1
}

# Generate Prisma client
Write-Host "`n⚙️  Generating Prisma client..." -ForegroundColor Yellow
try {
    npm run prisma:generate
    Write-Host "✅ Prisma client generated" -ForegroundColor Green
} catch {
    Write-Host "❌ Prisma client generation failed." -ForegroundColor Red
    exit 1
}

# Display deployment information
Write-Host "`n📋 Deployment Information:" -ForegroundColor Cyan
Write-Host "   Repository: https://github.com/shreyanshtri26/Customer-Contact-Reconciliation-System" -ForegroundColor White
Write-Host "   Build Command: npm install && npm run prisma:generate && npm run build" -ForegroundColor White
Write-Host "   Start Command: npm start" -ForegroundColor White
Write-Host "   Environment: Node.js" -ForegroundColor White

Write-Host "`n🔧 Required Environment Variables:" -ForegroundColor Cyan
Write-Host "   NODE_ENV = production" -ForegroundColor White
Write-Host "   DATABASE_URL = [Your PostgreSQL connection string]" -ForegroundColor White
Write-Host "   PORT = 3000" -ForegroundColor White

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://render.com and sign up/login" -ForegroundColor White
Write-Host "2. Create a new PostgreSQL database" -ForegroundColor White
Write-Host "3. Create a new Web Service and connect your GitHub repository" -ForegroundColor White
Write-Host "4. Use the configuration above" -ForegroundColor White
Write-Host "5. Add the environment variables" -ForegroundColor White
Write-Host "6. Deploy!" -ForegroundColor White

Write-Host "`n🌐 Your API will be available at:" -ForegroundColor Cyan
Write-Host "   https://[your-app-name].onrender.com/api/identify" -ForegroundColor White

Write-Host "`n✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host "   Proceed to Render.com to complete the deployment." -ForegroundColor Green 