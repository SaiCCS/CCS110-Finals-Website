<?php
declare(strict_types=1);

function databaseConnection(): PDO
{
    static $connection = null;
    if ($connection instanceof PDO) return $connection;

    // Vercel credentials are injected as environment variables. Local XAMPP keeps
    // using the ignored api/config.php file, so no secrets need to be committed.
    $environment = [
        'host' => getenv('DB_HOST'),
        'port' => getenv('DB_PORT') ?: '3306',
        'database' => getenv('DB_NAME'),
        'username' => getenv('DB_USER'),
        'password' => getenv('DB_PASSWORD'),
    ];
    $hasEnvironmentConfig = $environment['host'] !== false && $environment['host'] !== '';
    if ($hasEnvironmentConfig) {
        $config = $environment;
    } else {
        $configFile = __DIR__ . '/config.php';
        if (!is_file($configFile)) {
            throw new RuntimeException('Set DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD, or create api/config.php for local MySQL.');
        }
        $config = require $configFile;
    }

    foreach (['host', 'port', 'database', 'username', 'password'] as $key) {
        if (!array_key_exists($key, $config) || $config[$key] === false || $config[$key] === null) {
            throw new RuntimeException('A required MySQL connection setting is missing.');
        }
    }

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $config['host'], $config['port'], $config['database']);
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $sslCa = getenv('DB_SSL_CA');
    if ($sslCa !== false && trim($sslCa) !== '') {
        $caPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'room-live-mysql-ca-' . hash('sha256', $sslCa) . '.pem';
        if (!is_file($caPath) && file_put_contents($caPath, $sslCa, LOCK_EX) === false) {
            throw new RuntimeException('Could not prepare the MySQL TLS certificate.');
        }
        @chmod($caPath, 0600);
        $options[PDO::MYSQL_ATTR_SSL_CA] = $caPath;
        if (defined('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')) {
            $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
        }
    }
    $connection = new PDO($dsn, $config['username'], $config['password'], $options);
    return $connection;
}

function ensureAuthenticationSchema(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS auth_accounts (
        account_id VARCHAR(80) PRIMARY KEY,
        login_name VARCHAR(190) NOT NULL UNIQUE,
        email VARCHAR(190) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(160) NOT NULL,
        role VARCHAR(40) NOT NULL DEFAULT 'tenant',
        is_demo TINYINT(1) NOT NULL DEFAULT 0,
        profile_json JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    $pdo->exec("CREATE TABLE IF NOT EXISTS tenant_activity (
        account_id VARCHAR(80) PRIMARY KEY,
        activity_json JSON NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    $pdo->exec("CREATE TABLE IF NOT EXISTS app_sessions (
        session_id VARCHAR(128) PRIMARY KEY,
        session_data MEDIUMBLOB NOT NULL,
        last_activity INT UNSIGNED NOT NULL,
        INDEX idx_app_sessions_last_activity (last_activity)
    ) ENGINE=InnoDB");
    $column = $pdo->query("SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='app_users' AND column_name='username'")->fetchColumn();
    if ($column !== false && (int)$column < 190) $pdo->exec('ALTER TABLE app_users MODIFY username VARCHAR(190) NULL');
}

/** Store PHP sessions in MySQL when running on ephemeral serverless instances. */
final class MySqlSessionHandler implements SessionHandlerInterface
{
    public function __construct(private PDO $pdo) {}
    public function open(string $path, string $name): bool { return true; }
    public function close(): bool { return true; }

    public function read(string $id): string|false
    {
        $statement = $this->pdo->prepare('SELECT session_data FROM app_sessions WHERE session_id = ? AND last_activity >= ?');
        $statement->execute([$id, time() - (int)ini_get('session.gc_maxlifetime')]);
        $data = $statement->fetchColumn();
        return $data === false ? '' : (string)$data;
    }

    public function write(string $id, string $data): bool
    {
        $statement = $this->pdo->prepare('INSERT INTO app_sessions (session_id, session_data, last_activity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE session_data = VALUES(session_data), last_activity = VALUES(last_activity)');
        return $statement->execute([$id, $data, time()]);
    }

    public function destroy(string $id): bool
    {
        $statement = $this->pdo->prepare('DELETE FROM app_sessions WHERE session_id = ?');
        return $statement->execute([$id]);
    }

    public function gc(int $max_lifetime): int|false
    {
        $statement = $this->pdo->prepare('DELETE FROM app_sessions WHERE last_activity < ?');
        $statement->execute([time() - $max_lifetime]);
        return $statement->rowCount();
    }
}
