<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
session_set_cookie_params(['httponly' => true, 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'samesite' => 'Lax', 'path' => '/']);
session_start();
require_once __DIR__ . '/database.php';

function tenantRespond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function tenantText(mixed $value, int $limit, string $fallback = ''): string
{
    if (!is_string($value) && !is_numeric($value)) return $fallback;
    $value = trim((string)$value);
    return mb_strlen($value) <= $limit ? $value : $fallback;
}

try {
    $user = $_SESSION['user'] ?? null;
    if (!$user) tenantRespond(401, ['error' => 'Sign in to save renter account activity.']);
    if (!in_array($user['role'] ?? '', ['tenant','renter'], true)) tenantRespond(403, ['error' => 'This endpoint is for renter accounts.']);
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        tenantRespond(405, ['error' => 'Method not allowed.']);
    }
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 500_000) tenantRespond(413, ['error' => 'This renter activity save is too large.']);
    $input = json_decode(file_get_contents('php://input') ?: '', true, 512, JSON_THROW_ON_ERROR);
    $market = $input['marketplace'] ?? null;
    if (!is_array($market)) tenantRespond(400, ['error' => 'Provide marketplace account activity.']);

    $pdo = databaseConnection();
    $existingQuery = $pdo->prepare('SELECT activity_json FROM tenant_activity WHERE account_id=?');
    $existingQuery->execute([$user['id']]);
    $existing = json_decode((string)($existingQuery->fetchColumn() ?: '{}'), true);
    if (!is_array($existing)) $existing = [];

    $properties = [];
    foreach ($pdo->query('SELECT property_id,details_json FROM properties WHERE is_active=1')->fetchAll() as $property) {
        $details = json_decode((string)$property['details_json'], true);
        if (is_array($details)) $properties[$property['property_id']] = $details;
    }
    $validListing = static fn(mixed $id): bool => is_string($id) && isset($properties[$id]);

    $profileUser = null;
    foreach (($market['users'] ?? []) as $candidate) {
        if (is_array($candidate) && (string)($candidate['id'] ?? '') === (string)$user['id']) { $profileUser = $candidate; break; }
    }
    if ($profileUser) {
        $email = strtolower(tenantText($profileUser['email'] ?? $user['email'], 190));
        if ($email !== strtolower((string)$user['email'])) tenantRespond(422, ['error' => 'Changing the account email is not available in this profile form.']);
        $name = tenantText($profileUser['name'] ?? $user['name'], 160);
        if (mb_strlen($name) < 2) tenantRespond(422, ['error' => 'Enter a valid name.']);
        $profileJson = json_encode([
            'phone' => tenantText($profileUser['phone'] ?? '', 40), 'address' => tenantText($profileUser['address'] ?? '', 255),
            'city' => tenantText($profileUser['city'] ?? '', 120), 'province' => tenantText($profileUser['province'] ?? '', 120),
            'capabilities' => ['renter'], 'status' => 'Active', 'verified' => false,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $updateUser = $pdo->prepare("UPDATE app_users SET full_name=?,profile_json=? WHERE user_id=? AND role='renter'");
        $updateUser->execute([$name,$profileJson,$user['id']]);
        $updateAuth = $pdo->prepare("UPDATE auth_accounts SET full_name=?,profile_json=? WHERE account_id=? AND role='tenant'");
        $updateAuth->execute([$name,$profileJson,$user['id']]);
        $_SESSION['user']['name'] = $name;
        $user['name'] = $name;
    }

    $saved = [];
    foreach (array_slice(is_array($market['saved'] ?? null) ? $market['saved'] : [], 0, 100) as $id) {
        if ($validListing($id)) $saved[] = $id;
    }

    $applications = [];
    foreach (array_slice(is_array($market['applications'] ?? null) ? $market['applications'] : [], 0, 100) as $item) {
        if (!is_array($item) || !$validListing($item['listingId'] ?? null)) continue;
        foreach (($existing['applications'] ?? []) as $savedApplication) {
            if (($savedApplication['listingId'] ?? null) === $item['listingId'] && in_array($savedApplication['status'] ?? '', ['Pending','Approved'], true)) {
                $applications[] = $savedApplication;
                continue 2;
            }
        }
        $previous = null;
        foreach (($existing['applications'] ?? []) as $savedApplication) {
            if (($savedApplication['id'] ?? null) === ($item['id'] ?? null) && ($savedApplication['listingId'] ?? null) === $item['listingId']) { $previous = $savedApplication; break; }
        }
        if ($previous) { $applications[] = $previous; continue; }
        $phone = tenantText($item['phone'] ?? '', 40);
        $moveInDate = is_string($item['moveInDate'] ?? null) ? DateTime::createFromFormat('!Y-m-d', $item['moveInDate']) : false;
        $moveIn = $moveInDate && $moveInDate->format('Y-m-d') === $item['moveInDate'] ? $item['moveInDate'] : '';
        $applications[] = [
            'id' => 'app-' . bin2hex(random_bytes(8)), 'listingId' => $item['listingId'],
            'userId' => $user['id'], 'renterId' => $user['id'], 'renterName' => $user['name'],
            'renterEmail' => $user['email'], 'phone' => $phone, 'moveInDate' => $moveIn,
            'occupants' => max(1, min(10, (int)($item['occupants'] ?? 1))),
            'message' => tenantText($item['message'] ?? '', 500),
            'date' => date('Y-m-d'), 'status' => 'Pending',
        ];
    }

    $messages = [];
    foreach (array_slice(is_array($market['messages'] ?? null) ? $market['messages'] : [], 0, 100) as $item) {
        if (!is_array($item) || !$validListing($item['listingId'] ?? null)) continue;
        if (($item['from'] ?? '') !== $user['id']) continue;
        $previous = null;
        foreach (($existing['messages'] ?? []) as $savedMessage) {
            if (($savedMessage['id'] ?? null) === ($item['id'] ?? null) && ($savedMessage['listingId'] ?? null) === $item['listingId']) { $previous = $savedMessage; break; }
        }
        if ($previous) { $messages[] = $previous; continue; }
        $listing = $properties[$item['listingId']];
        $body = tenantText($item['body'] ?? '', 1000);
        if ($body === '') continue;
        $messages[] = [
            'id' => 'msg-' . bin2hex(random_bytes(8)), 'from' => $user['id'], 'to' => $listing['ownerId'] ?? '',
            'ownerId' => $listing['ownerId'] ?? '', 'fromName' => $user['name'], 'listingId' => $item['listingId'],
            'subject' => tenantText($listing['name'] ?? 'Rental inquiry', 160), 'body' => $body, 'date' => date('Y-m-d'),
        ];
    }

    $maintenance = [];
    foreach (array_slice(is_array($market['maintenance'] ?? null) ? $market['maintenance'] : [], 0, 100) as $item) {
        if (!is_array($item) || !$validListing($item['listingId'] ?? null)) continue;
        $previous = null;
        foreach (($existing['maintenance'] ?? []) as $savedIssue) {
            if (($savedIssue['id'] ?? null) === ($item['id'] ?? null) && ($savedIssue['listingId'] ?? null) === $item['listingId']) { $previous = $savedIssue; break; }
        }
        if ($previous) { $maintenance[] = $previous; continue; }
        $title = tenantText($item['title'] ?? '', 160);
        if ($title === '') continue;
        $maintenance[] = ['id' => 'maintenance-' . bin2hex(random_bytes(8)), 'title' => $title, 'listingId' => $item['listingId'], 'renterId' => $user['id'], 'ownerId' => $properties[$item['listingId']]['ownerId'] ?? '', 'date' => date('Y-m-d'), 'status' => 'Submitted'];
    }

    $paymentIntents = [];
    foreach (array_slice(is_array($market['paymentIntents'] ?? null) ? $market['paymentIntents'] : [], 0, 100) as $item) {
        if (!is_array($item) || !$validListing($item['listingId'] ?? null)) continue;
        $previous = null;
        foreach (($existing['paymentIntents'] ?? []) as $savedIntent) {
            if (($savedIntent['id'] ?? null) === ($item['id'] ?? null) && ($savedIntent['listingId'] ?? null) === $item['listingId']) { $previous = $savedIntent; break; }
        }
        $paymentIntents[] = $previous ?: ['id' => 'intent-' . bin2hex(random_bytes(8)), 'listingId' => $item['listingId'], 'renterId' => $user['id'], 'amount' => (float)($properties[$item['listingId']]['rent'] ?? 0), 'date' => date('Y-m-d'), 'status' => 'Intent only'];
    }

    $landlordApplications = [];
    foreach (array_slice(is_array($market['landlordApplications'] ?? null) ? $market['landlordApplications'] : [], 0, 20) as $item) {
        if (!is_array($item)) continue;
        $previous = null;
        foreach (($existing['landlordApplications'] ?? []) as $savedApplication) {
            if (($savedApplication['id'] ?? null) === ($item['id'] ?? null)) { $previous = $savedApplication; break; }
        }
        $landlordApplications[] = $previous ?: [
            'id' => 'landlord-app-' . bin2hex(random_bytes(8)), 'userId' => $user['id'],
            'businessName' => tenantText($item['businessName'] ?? '', 160), 'propertyAddress' => tenantText($item['propertyAddress'] ?? '', 255),
            'phone' => tenantText($item['phone'] ?? '', 40), 'description' => tenantText($item['description'] ?? '', 1000),
            'documentName' => tenantText($item['documentName'] ?? '', 180), 'status' => 'Submitted', 'date' => date('Y-m-d'),
        ];
    }

    $reports = [];
    foreach (array_slice(is_array($market['reports'] ?? null) ? $market['reports'] : [], 0, 100) as $item) {
        if (!is_array($item) || !$validListing($item['listingId'] ?? null)) continue;
        $previous = null;
        foreach (($existing['reports'] ?? []) as $savedReport) {
            if (($savedReport['id'] ?? null) === ($item['id'] ?? null) && ($savedReport['listingId'] ?? null) === $item['listingId']) { $previous = $savedReport; break; }
        }
        $reports[] = $previous ?: ['id' => 'report-' . bin2hex(random_bytes(8)), 'listingId' => $item['listingId'], 'reason' => tenantText($item['reason'] ?? '', 500), 'renterId' => $user['id'], 'date' => date('Y-m-d'), 'status' => 'Open'];
    }

    $reviews = [];
    foreach (array_slice(is_array($market['reviews'] ?? null) ? $market['reviews'] : [], 0, 100) as $item) {
        if (!is_array($item) || !is_string($item['leaseId'] ?? null)) continue;
        foreach (($existing['reviews'] ?? []) as $savedReview) {
            if (($savedReview['leaseId'] ?? null) === $item['leaseId']) { $reviews[] = $savedReview; continue 2; }
        }
        $leaseQuery = $pdo->prepare("SELECT lease_id,property_id,renter_name,status FROM leases WHERE lease_id=? AND renter_id=? AND status='Completed'");
        $leaseQuery->execute([$item['leaseId'],$user['id']]);
        $lease = $leaseQuery->fetch();
        $propertyRating = filter_var($item['propertyRating'] ?? null, FILTER_VALIDATE_INT);
        $ownerRating = filter_var($item['ownerRating'] ?? null, FILTER_VALIDATE_INT);
        if (!$lease || $propertyRating === false || $ownerRating === false || $propertyRating < 1 || $propertyRating > 5 || $ownerRating < 1 || $ownerRating > 5) continue;
        $reviews[] = ['id' => 'review-' . bin2hex(random_bytes(8)), 'leaseId' => $lease['lease_id'], 'renterId' => $user['id'], 'renterName' => $user['name'], 'listingId' => $lease['property_id'], 'propertyRating' => $propertyRating, 'ownerRating' => $ownerRating, 'body' => tenantText($item['body'] ?? '', 1000), 'status' => 'Visible', 'verifiedStay' => true, 'date' => date('Y-m-d')];
    }

    $activity = [
        'saved' => array_values(array_unique($saved)),
        // Re-submit is treated as an upsert of this account's own queue. The server assigns owner, ID, and status.
        'applications' => $applications,
        'messages' => $messages,
        'maintenance' => $maintenance,
        'paymentIntents' => $paymentIntents,
        'landlordApplications' => $landlordApplications,
        'reviews' => $reviews,
        'reports' => $reports,
    ];
    $save = $pdo->prepare('INSERT INTO tenant_activity (account_id,activity_json) VALUES (?,?) ON DUPLICATE KEY UPDATE activity_json=VALUES(activity_json)');
    $save->execute([$user['id'], json_encode($activity, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)]);
    tenantRespond(200, ['success' => true]);
} catch (JsonException $error) {
    tenantRespond(400, ['error' => 'Invalid JSON request.']);
} catch (PDOException $error) {
    error_log('Tenant activity save failed: ' . $error->getMessage());
    tenantRespond(500, ['error' => 'Could not save renter activity to MySQL.']);
} catch (Throwable $error) {
    error_log('Tenant activity save failed: ' . $error->getMessage());
    tenantRespond(500, ['error' => 'Could not save renter activity.']);
}
