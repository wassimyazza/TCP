Invoke-WebRequest -UseBasicParsing http://localhost:3001/api/stats/global |
  Select-Object -ExpandProperty StatusCode