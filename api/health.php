<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require_once __DIR__ . '/database.php';

try {
    $pdo = databaseConnection();
    ensureAuthenticationSchema($pdo);
    $pdo->query('SELECT 1')->fetchColumn();
    $required = ['app_migrations','app_users','auth_accounts','leases','platform_payloads','properties','rent_payments','state_scopes','tenant_activity','tenants','units','utility_bill_items','utility_bills','utility_types'];
    $query = $pdo->prepare('SELECT table_name FROM information_schema.tables WHERE table_schema=DATABASE()');
    $query->execute();
    $available = array_fill_keys($query->fetchAll(PDO::FETCH_COLUMN), true);
    $missing = array_values(array_filter($required, static fn(string $name): bool => !isset($available[$name])));
    $ready = $missing === [];
    http_response_code($ready ? 200 : 503);
    echo json_encode([
        'success' => $ready,
        'php' => true,
        'database' => true,
        'schemaReady' => $ready,
        'missingTables' => $missing,
        'message' => $ready ? 'PHP and MySQL are connected; required tables are available.' : 'PHP and MySQL are connected, but the schema is incomplete.',
    ], JSON_UNESCAPED_SLASHES);
} catch (Throwable $error) {
    error_log('Database health check failed: ' . $error->getMessage());
    http_response_code(503);
    echo json_encode(['success' => false, 'php' => true, 'database' => false, 'schemaReady' => false, 'message' => 'PHP is running but the database connection failed. Check api/config.php and MySQL.'], JSON_UNESCAPED_SLASHES);
}
