# Script de pruebas para verificar el backend

Write-Host "============ PRUEBAS DEL BACKEND ============" -ForegroundColor Cyan

# Token de admin desde la sesión anterior
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwYWEwMzYzNy00Zjc5LTQxYmMtOWQ1Zi0zNmFjYWZmNjgyMWIiLCJlbWFpbCI6ImFkbWluQHNlY3VyZS5jb20iLCJyb2xlcyI6WyJBRE1JTiJdLCJzdG9yZUlkIjoiMzRmZjdhNjUtZGU4Mi00NTk3LTliZjItYjE5NGE1Yzk4MmUwIiwiaWF0IjoxNzc4MDkxNjE5LCJleHAiOjE3NzgwOTUyMTl9.vCVLNarojx-fo1H507KxMJ-90F-2sDh6zHg7TWafwts"
$headers = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}

Write-Host ""
Write-Host "✓ TEST 1: Health Check"
$response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET
Write-Host "Status: $($response.StatusCode) - OK`n"

Write-Host "✓ TEST 2: Acceso sin autenticación (debe fallar)"
try {
  Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method GET -ErrorAction Stop
  Write-Host "ERROR: Debería haber rechazado la solicitud"
} catch {
  Write-Host "Status: $($_.Exception.Response.StatusCode) - Acceso rechazado (esperado)`n"
}

Write-Host "✓ TEST 3: Obtener productos con autenticación"
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method GET -Headers $headers
$products = $response.Content | ConvertFrom-Json
Write-Host "Total productos: $($products.Count)"
Write-Host "Primer producto: $($products[0].name) - Precio: $($products[0].price)`n"

Write-Host "✓ TEST 4: Obtener roles (RBAC)"
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/roles" -Method GET -Headers $headers
$roles = $response.Content | ConvertFrom-Json
Write-Host "Roles encontrados: $($roles.Count)"
foreach ($role in $roles) {
  Write-Host "  - $($role.name): $($role.description)"
}
Write-Host ""

Write-Host "✓ TEST 5: Obtener usuarios"
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/users" -Method GET -Headers $headers
$users = $response.Content | ConvertFrom-Json
Write-Host "Total usuarios: $($users.Count)"
foreach ($user in $users | Select-Object -First 3) {
  $roleNames = $user.roles | ForEach-Object { ($_ -split '"')[3] } | Where-Object { $_ -ne "" }
  Write-Host "  - $($user.email): $($roleNames -join ', ')"
}
Write-Host ""

Write-Host "✓ TEST 6: Obtener tiendas"
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/stores" -Method GET -Headers $headers
$stores = $response.Content | ConvertFrom-Json
Write-Host "Total tiendas: $($stores.Count)"
foreach ($store in $stores) {
  Write-Host "  - $($store.name): $($store.address)"
}
Write-Host ""

Write-Host "✓ TEST 7: Obtener logs de auditoría"
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/audit" -Method GET -Headers $headers
$logs = $response.Content | ConvertFrom-Json
Write-Host "Total logs: $($logs.data.Count)"
Write-Host "Últimos 3 eventos:"
foreach ($log in $logs.data | Select-Object -First 3) {
  Write-Host "  - [$($log.action)] $($log.description)"
}
Write-Host ""

Write-Host "============ PRUEBAS COMPLETADAS ============" -ForegroundColor Green
