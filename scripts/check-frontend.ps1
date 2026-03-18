Invoke-WebRequest -UseBasicParsing http://localhost:3000 |
  Select-Object -ExpandProperty StatusCode