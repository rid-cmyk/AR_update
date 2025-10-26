# PowerShell script to run ujian system migration
Write-Host "🚀 Running Ujian System Migration..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Load environment variables
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

$DATABASE_URL = $env:DATABASE_URL
if (-not $DATABASE_URL) {
    Write-Host "❌ DATABASE_URL not found in .env!" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Running database migration..." -ForegroundColor Yellow

# Run Prisma migration
try {
    npx prisma db push
    Write-Host "✅ Prisma schema updated successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Prisma migration failed: $_" -ForegroundColor Red
    exit 1
}

# Run custom SQL migration
try {
    Write-Host "📝 Running custom SQL migration..." -ForegroundColor Yellow
    
    # You can use psql or any other database client here
    # For now, we'll just show the SQL file location
    Write-Host "📄 Please run the SQL file manually: scripts/update-ujian-system.sql" -ForegroundColor Cyan
    Write-Host "   Or use: psql `$DATABASE_URL -f scripts/update-ujian-system.sql" -ForegroundColor Cyan
    
} catch {
    Write-Host "⚠️  Custom SQL migration needs manual execution" -ForegroundColor Yellow
}

Write-Host "🎉 Migration completed! Please restart your development server." -ForegroundColor Green