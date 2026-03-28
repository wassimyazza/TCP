Start-Sleep -Seconds 5
Invoke-WebRequest -UseBasicParsing http://localhost:3000 |
  Select-Object -ExpandProperty StatusCode