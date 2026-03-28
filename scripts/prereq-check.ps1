$docker = Get-Command docker -ErrorAction SilentlyContinue
$node = Get-Command node -ErrorAction SilentlyContinue
Write-Host "Docker:" ([bool]$docker)
Write-Host "Node:" ([bool]$node)