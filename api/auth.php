<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require_once __DIR__ . '/database.php';

$isVercel = getenv('VERCEL') === '1';
if ($isVercel) {
    // PHP's default file sessions are not shared between serverless instances.
    $sessionPdo = databaseConnection();
    ensureAuthenticationSchema($sessionPdo);
    session_set_save_handler(new MySqlSessionHandler($sessionPdo), true);
}

session_set_cookie_params([
    'httponly' => true,
    'secure' => $isVercel || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'samesite' => 'Lax',
    'path' => '/',
]);
session_start();

function authRespond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function ensureAuthTable(PDO $pdo): void
{
    ensureAuthenticationSchema($pdo);

    $demoAccountsEnabled = getenv('ENABLE_DEMO_ACCOUNTS');
    if ($demoAccountsEnabled === false) $demoAccountsEnabled = getenv('VERCEL') === '1' ? 'false' : 'true';
    if (filter_var($demoAccountsEnabled, FILTER_VALIDATE_BOOLEAN)) {
        $insert = $pdo->prepare('INSERT IGNORE INTO auth_accounts (account_id,login_name,email,password_hash,full_name,role,is_demo,profile_json) VALUES (?,?,?,?,?,?,1,?)');
        $demoAccounts = [
            ['demo-admin','admin','admin@roomtolive.ph','admin','System Administrator','admin'],
            ['demo-landlord','landlord','landlord@roomtolive.ph','landlord','Maria Santos','landlord'],
            ['demo-tenant','tenant','tenant@roomtolive.ph','tenant','Juan Dela Cruz','tenant'],
        ];
        foreach ($demoAccounts as [$id,$username,$email,$password,$name,$role]) {
            $insert->execute([$id,$username,$email,password_hash($password, PASSWORD_DEFAULT),$name,$role,'{}']);
        }
    }
}

function publicAccount(array $row): array
{
    $profile = json_decode((string)($row['profile_json'] ?? '{}'), true);
    if (!is_array($profile)) $profile = [];
    return array_merge($profile, [
        'id' => $row['account_id'],
        'username' => $row['login_name'],
        'email' => $row['email'],
        'name' => $row['full_name'],
        'role' => $row['role'],
    ]);
}

function createSession(array $account): array
{
    session_regenerate_id(true);
    $profile = json_decode((string)($account['profile_json'] ?? '{}'), true);
    if (!is_array($profile)) $profile = [];
    $user = [
        'id' => $account['account_id'],
        'username' => $account['login_name'],
        'email' => $account['email'],
        'name' => $account['full_name'],
        'role' => $account['role'],
    ];
    foreach (['phone','address','city','province'] as $field) {
        if (isset($profile[$field]) && is_string($profile[$field])) $user[$field] = $profile[$field];
    }
    $_SESSION['user'] = $user;
    return $user;
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        authRespond(405, ['error' => 'Method not allowed.']);
    }

    $input = json_decode(file_get_contents('php://input') ?: '', true, 512, JSON_THROW_ON_ERROR);
    $action = $input['action'] ?? '';

    // Logout must revoke the PHP session even if MySQL is unavailable.
    if ($action === 'logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        authRespond(200, ['success' => true]);
    }

    $pdo = databaseConnection();
    ensureAuthTable($pdo);

    if ($action === 'register') {
        $name = trim((string)($input['name'] ?? ''));
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $password = (string)($input['password'] ?? '');
        $phone = trim((string)($input['phone'] ?? ''));
        $address = trim((string)($input['address'] ?? ''));
        $city = trim((string)($input['city'] ?? ''));
        $province = trim((string)($input['province'] ?? ''));

        if (mb_strlen($name) < 2 || mb_strlen($name) > 160 || strlen($email) > 190 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8 || strlen($password) > 72) {
            authRespond(422, ['error' => 'Enter a name (2–160 characters), valid email, and password (8–72 bytes).']);
        }
        if (mb_strlen($phone) > 40 || mb_strlen($address) > 255 || mb_strlen($city) > 120 || mb_strlen($province) > 120) {
            authRespond(422, ['error' => 'One of the contact fields is too long.']);
        }
        $duplicate = $pdo->prepare('SELECT account_id FROM auth_accounts WHERE email=? OR login_name=? LIMIT 1');
        $duplicate->execute([$email,$email]);
        if ($duplicate->fetch()) authRespond(409, ['error' => 'An account with this email already exists. Try signing in instead.']);

        $accountId = 'renter-' . bin2hex(random_bytes(8));
        $profile = [
            'phone' => $phone, 'address' => $address, 'city' => $city, 'province' => $province,
            'capabilities' => ['renter'], 'status' => 'Active', 'verified' => false,
        ];
        $pdo->beginTransaction();
        // A previous frontend-only signup may have saved the profile without
        // saving credentials. Reuse that profile ID so the user can finish signup.
        $existingProfile = $pdo->prepare("SELECT user_id FROM app_users WHERE LOWER(email)=? AND role IN ('renter','tenant') ORDER BY user_id LIMIT 1");
        $existingProfile->execute([$email]);
        $profileRow = $existingProfile->fetch();
        if ($profileRow) $accountId = (string)$profileRow['user_id'];
        else {
            $protectedProfile = $pdo->prepare('SELECT role FROM app_users WHERE LOWER(email)=? LIMIT 1');
            $protectedProfile->execute([$email]);
            if ($protectedProfile->fetchColumn()) {
                $pdo->rollBack();
                authRespond(409, ['error' => 'This email is already associated with a non-renter profile. Use a different email or contact an administrator.']);
            }
        }

        $usernameOwner = $pdo->prepare('SELECT user_id FROM app_users WHERE username=? AND user_id<>? LIMIT 1');
        $usernameOwner->execute([$email,$accountId]);
        if ($usernameOwner->fetch()) {
            $pdo->rollBack();
            authRespond(409, ['error' => 'This email is already attached to another profile. Contact an administrator.']);
        }
        $insert = $pdo->prepare('INSERT INTO auth_accounts (account_id,login_name,email,password_hash,full_name,role,is_demo,profile_json) VALUES (?,?,?,?,?,?,0,?)');
        $insert->execute([$accountId,$email,$email,password_hash($password, PASSWORD_DEFAULT),$name,'tenant',json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)]);
        $marketProfile = array_merge($profile, ['id' => $accountId, 'username' => $email, 'email' => $email, 'name' => $name, 'role' => 'renter']);
        $appUser = $pdo->prepare('INSERT INTO app_users (user_id,username,email,full_name,role,profile_json) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE username=VALUES(username),email=VALUES(email),full_name=VALUES(full_name),role=VALUES(role),profile_json=VALUES(profile_json)');
        $appUser->execute([$accountId,$email,$email,$name,'renter',json_encode($marketProfile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)]);
        $pdo->commit();
        $user = createSession(['account_id' => $accountId,'login_name' => $email,'email' => $email,'full_name' => $name,'role' => 'tenant']);
        authRespond(201, ['success' => true, 'user' => $user]);
    }

    if ($action === 'update-profile') {
        $user = $_SESSION['user'] ?? null;
        if (!$user) authRespond(401, ['error' => 'Sign in before updating your profile.']);
        $name = trim((string)($input['name'] ?? ''));
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $phone = trim((string)($input['phone'] ?? ''));
        $address = trim((string)($input['address'] ?? ''));
        $city = trim((string)($input['city'] ?? ''));
        $province = trim((string)($input['province'] ?? ''));
        if (mb_strlen($name) < 2 || mb_strlen($name) > 160 || strlen($email) > 190 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            authRespond(422, ['error' => 'Enter a name (2–160 characters) and a valid email address.']);
        }
        if (mb_strlen($phone) > 40 || mb_strlen($address) > 255 || mb_strlen($city) > 120 || mb_strlen($province) > 120) {
            authRespond(422, ['error' => 'One of the contact fields is too long.']);
        }
        $accountQuery = $pdo->prepare('SELECT login_name,email,profile_json FROM auth_accounts WHERE account_id=?');
        $accountQuery->execute([$user['id']]);
        $account = $accountQuery->fetch();
        if (!$account) authRespond(401, ['error' => 'Your sign-in session has expired. Sign in again.']);
        $duplicate = $pdo->prepare('SELECT account_id FROM auth_accounts WHERE (email=? OR login_name=?) AND account_id<>? LIMIT 1');
        $duplicate->execute([$email,$email,$user['id']]);
        if ($duplicate->fetch()) authRespond(409, ['error' => 'That email is already attached to another account.']);

        $profile = json_decode((string)$account['profile_json'], true);
        if (!is_array($profile)) $profile = [];
        $profile = array_merge($profile, ['phone' => $phone, 'address' => $address, 'city' => $city, 'province' => $province]);
        $oldEmail = strtolower((string)$account['email']);
        $loginName = strtolower((string)$account['login_name']) === $oldEmail ? $email : (string)$account['login_name'];
        $marketplaceId = $user['id'] === 'demo-landlord' ? 'owner-demo' : $user['id'];

        $pdo->beginTransaction();
        $updateAccount = $pdo->prepare('UPDATE auth_accounts SET login_name=?,email=?,full_name=?,profile_json=? WHERE account_id=?');
        $updateAccount->execute([$loginName,$email,$name,json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),$user['id']]);
        $marketProfileQuery = $pdo->prepare('SELECT profile_json FROM app_users WHERE user_id=?');
        $marketProfileQuery->execute([$marketplaceId]);
        $marketProfile = json_decode((string)($marketProfileQuery->fetchColumn() ?: '{}'), true);
        if (!is_array($marketProfile)) $marketProfile = [];
        $marketProfile = array_merge($marketProfile, $profile);
        $updateMarketUser = $pdo->prepare('UPDATE app_users SET username=?,email=?,full_name=?,profile_json=? WHERE user_id=?');
        $updateMarketUser->execute([$loginName,$email,$name,json_encode($marketProfile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),$marketplaceId]);
        $pdo->commit();
        $_SESSION['user'] = array_merge($user, ['username' => $loginName, 'email' => $email, 'name' => $name, 'phone' => $phone, 'address' => $address, 'city' => $city, 'province' => $province]);
        authRespond(200, ['success' => true, 'user' => $_SESSION['user']]);
    }

    if ($action === 'login') {
        $login = strtolower(trim((string)($input['username'] ?? '')));
        $password = (string)($input['password'] ?? '');
        if ($login === '' || $password === '') authRespond(422, ['error' => 'Enter your username/email and password.']);
        $find = $pdo->prepare('SELECT a.*,u.role AS marketplace_role,u.profile_json AS marketplace_profile_json FROM auth_accounts a LEFT JOIN app_users u ON u.user_id=a.account_id WHERE a.login_name=? OR a.email=? LIMIT 1');
        $find->execute([$login,$login]);
        $account = $find->fetch();
        if (!$account || !password_verify($password, $account['password_hash'])) {
            authRespond(401, ['error' => 'Invalid username/email or password.']);
        }
        // Admin approval is stored in the marketplace profile. Honor that
        // role on the next login so it does not revert to renter after refresh.
        if (($account['marketplace_role'] ?? '') === 'landlord') {
            $profile = json_decode((string)($account['marketplace_profile_json'] ?? '{}'), true);
            if (is_array($profile) && in_array('landlord', $profile['capabilities'] ?? [], true)) {
                $account['role'] = 'landlord';
            }
        }
        $user = createSession($account);
        authRespond(200, ['success' => true, 'user' => $user]);
    }

    authRespond(400, ['error' => 'Unknown account action.']);
} catch (JsonException $error) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON request.']);
} catch (PDOException $error) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log($error->getMessage());
    authRespond(500, ['error' => 'Account storage failed. Check the MySQL connection settings.']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log($error->getMessage());
    authRespond(500, ['error' => 'The account request could not be completed.']);
}
