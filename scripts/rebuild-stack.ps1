Set-Location (Join-Path $PSScriptRoot "..")
docker compose down
docker compose up --build -d