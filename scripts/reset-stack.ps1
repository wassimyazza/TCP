Set-Location (Join-Path $PSScriptRoot "..")
docker compose down -v
docker compose up --build -d