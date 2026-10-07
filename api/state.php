<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

require_once __DIR__ . '/database.php';

function validKey(mixed $key): bool
{
    return is_string($key) && preg_match('/^[a-zA-Z0-9:_-]{1,120}$/', $key) === 1;
}

function decoded(?string $json): array
{
    if ($json === null || $json === '') return [];
    $value = json_decode($json, true);
    return is_array($value) ? $value : [];
}

function jsonValue(mixed $value): string
{
    return json_encode($value ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
}

function textValue(mixed $value, string $fallback = ''): string
{
    return is_scalar($value) ? (string)$value : $fallback;
}

function nullableDate(mixed $value): ?string
{
    $value = trim(textValue($value));
    return $value !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) ? $value : null;
}

function getState(PDO $pdo, string $key): ?array
{
    $scopeQuery = $pdo->prepare('SELECT property_id, settings_json, is_bootstrapped FROM state_scopes WHERE scope_key = ?');
    $scopeQuery->execute([$key]);
    $scope = $scopeQuery->fetch();
    if (!$scope || !(int)$scope['is_bootstrapped']) return null;

    $propertyId = $scope['property_id'];
    $settings = decoded($scope['settings_json']);
    $unitQuery = $pdo->prepare('SELECT * FROM units WHERE scope_key = ? ORDER BY unit_number, unit_id');
    $unitQuery->execute([$key]);
    $units = [];
    $marketUnits = [];
    foreach ($unitQuery->fetchAll() as $row) {
        $unit = array_merge(decoded($row['details_json']), [
            'id' => $row['unit_id'], 'number' => $row['unit_number'], 'type' => $row['unit_type'],
            'floor' => $row['floor_label'] === null ? '' : $row['floor_label'],
            'monthlyRent' => (float)$row['monthly_rent'], 'capacity' => (int)$row['capacity'],
            'description' => $row['description'], 'status' => $row['status'],
        ]);
        if ($row['unit_kind'] === 'marketplace') {
            $unit['listingId'] = $row['property_id'];
            $marketUnits[] = $unit;
        } else {
            $units[] = $unit;
        }
    }

    $tenantQuery = $pdo->prepare('SELECT * FROM tenants WHERE scope_key = ? ORDER BY last_name, first_name');
    $tenantQuery->execute([$key]);
    $tenants = [];
    foreach ($tenantQuery->fetchAll() as $row) {
        $tenants[] = array_merge(decoded($row['details_json']), [
            'id' => $row['tenant_id'], 'firstName' => $row['first_name'], 'lastName' => $row['last_name'],
            'phone' => $row['phone'], 'email' => $row['email'], 'address' => $row['address'],
            'unitId' => $row['unit_id'], 'moveInDate' => $row['move_in_date'] ?? '',
            'status' => $row['status'], 'monthlyRent' => (float)$row['monthly_rent'],
        ]);
    }

    $paymentQuery = $pdo->prepare('SELECT * FROM rent_payments WHERE scope_key = ? ORDER BY payment_id');
    $paymentQuery->execute([$key]);
    $payments = [];
    foreach ($paymentQuery->fetchAll() as $row) {
        $payments[] = array_merge(decoded($row['details_json']), [
            'id' => $row['payment_id'], 'tenantId' => $row['tenant_id'], 'unitId' => $row['unit_id'],
            'billingMonth' => $row['billing_month'], 'amount' => (float)$row['amount'],
            'paymentDate' => $row['payment_date'] ?? '', 'paymentMethod' => $row['payment_method'],
            'reference' => $row['reference_code'], 'notes' => $row['notes'], 'status' => $row['status'],
        ]);
    }

    $billQuery = $pdo->prepare(
        'SELECT b.*, i.bill_item_id, i.previous_reading, i.current_reading, i.amount, i.details_json AS item_json, t.type_name '
        . 'FROM utility_bills b JOIN utility_bill_items i ON i.scope_key=b.scope_key AND i.bill_id=b.bill_id '
        . 'JOIN utility_types t ON t.utility_type_id=i.utility_type_id WHERE b.scope_key=? ORDER BY b.bill_id, i.bill_item_id'
    );
    $billQuery->execute([$key]);
    $bills = [];
    foreach ($billQuery->fetchAll() as $row) {
        $base = decoded($row['details_json']);
        $item = decoded($row['item_json']);
        $bills[] = array_merge($base, $item, [
            'id' => $base['id'] ?? $row['bill_item_id'], 'tenantId' => $row['tenant_id'], 'unitId' => $row['unit_id'],
            'type' => $row['type_name'], 'billingPeriod' => $row['billing_period'],
            'previousReading' => $row['previous_reading'] === null ? '' : (float)$row['previous_reading'],
            'currentReading' => $row['current_reading'] === null ? '' : (float)$row['current_reading'],
            'amount' => (float)$row['amount'], 'dueDate' => $row['due_date'] ?? '',
            'status' => $row['status'], 'notes' => $row['notes'],
        ]);
    }

    $properties = [];
    $users = [];
    $leases = [];
    $extras = ['marketplace' => []];
    if ($key === 'narra-house-prototype-v3') {
        foreach ($pdo->query('SELECT property_id, property_name, address, details_json FROM properties WHERE is_active=1 ORDER BY property_id')->fetchAll() as $row) {
            $properties[] = array_merge(decoded($row['details_json']), ['id' => $row['property_id'], 'name' => $row['property_name'], 'address' => $row['address']]);
        }
        foreach ($pdo->query('SELECT user_id, username, email, full_name, role, profile_json FROM app_users ORDER BY user_id')->fetchAll() as $row) {
            $users[] = array_merge(decoded($row['profile_json']), ['id' => $row['user_id'], 'username' => $row['username'], 'email' => $row['email'], 'name' => $row['full_name'], 'role' => $row['role']]);
        }
        foreach ($pdo->query('SELECT * FROM leases ORDER BY lease_id')->fetchAll() as $row) {
            $leases[] = array_merge(decoded($row['details_json']), [
                'id' => $row['lease_id'], 'listingId' => $row['property_id'], 'unitId' => $row['unit_id'],
                'renterId' => $row['renter_id'], 'renterName' => $row['renter_name'], 'rent' => (float)$row['rent_amount'],
                'status' => $row['status'], 'startDate' => $row['start_date'] ?? '', 'endDate' => $row['end_date'] ?? '',
            ]);
        }
        $payloadQuery = $pdo->prepare('SELECT payload FROM platform_payloads WHERE scope_key=?');
        $payloadQuery->execute([$key]);
        $payload = decoded($payloadQuery->fetchColumn() ?: null);
        $extras = decoded(json_encode($payload['rootExtras'] ?? []));
        $marketExtras = decoded(json_encode($payload['marketExtras'] ?? []));
        $tenantActivityQuery = $pdo->query('SELECT activity_json FROM tenant_activity');
        foreach ($tenantActivityQuery->fetchAll(PDO::FETCH_COLUMN) as $activityJson) {
            $activity = decoded($activityJson);
            foreach (['applications','messages','maintenance','paymentIntents','landlordApplications','reviews','reports'] as $collection) {
                if (!is_array($activity[$collection] ?? null)) continue;
                $knownIds = array_fill_keys(array_map(static fn($item): string => is_array($item) ? textValue($item['id'] ?? '') : '', $marketExtras[$collection] ?? []), true);
                foreach ($activity[$collection] as $item) {
                    if (!is_array($item) || !isset($item['id'])) continue;
                    $id = textValue($item['id']);
                    if (!isset($knownIds[$id])) { $marketExtras[$collection][] = $item; $knownIds[$id] = true; }
                }
            }
        }
        $marketExtras['listings'] = $properties;
        $marketExtras['users'] = $users;
        $marketExtras['units'] = $marketUnits;
        $marketExtras['leases'] = $leases;
        $extras['marketplace'] = $marketExtras;
    }

    return array_merge($extras, [
        'tenants' => $tenants,
        'units' => $units,
        'payments' => $payments,
        'utilityBills' => $bills,
        'settings' => $settings,
    ]);
}

function marketplaceOwnerId(array $user): string
{
    $accountId = textValue($user['id'] ?? '');
    // The classroom demo login is linked to the preloaded marketplace owner.
    return $accountId === 'demo-landlord' ? 'owner-demo' : $accountId;
}

function propertyOwnedBy(PDO $pdo, string $propertyId, string $ownerId): bool
{
    $query = $pdo->prepare('SELECT details_json FROM properties WHERE property_id=? AND is_active=1');
    $query->execute([$propertyId]);
    $details = decoded($query->fetchColumn() ?: null);
    return (string)($details['ownerId'] ?? '') === $ownerId;
}

function ownsStateScope(PDO $pdo, string $key, array $user): bool
{
    // The root scope also carries public marketplace data. Its landlord view is
    // filtered below and its write path merges only that landlord's records.
    if ($key === 'narra-house-prototype-v3') return true;
    $propertyId = $key === 'narra-house-prototype-v3'
        ? 'home-narra'
        : (str_starts_with($key, 'room-to-live-operations:')
            ? substr($key, strlen('room-to-live-operations:'))
            : '');
    if ($propertyId === '' || !preg_match('/^[a-zA-Z0-9_-]{1,80}$/', $propertyId)) return false;
    return propertyOwnedBy($pdo, $propertyId, marketplaceOwnerId($user));
}

function managerViewForOwner(array $state, string $ownerId, string $accountId, bool $ownsRootOperations): array
{
    if (!is_array($state['marketplace'] ?? null)) return $state;
    $market = $state['marketplace'];
    $ownedIds = [];
    foreach (($market['listings'] ?? []) as $listing) {
        if (is_array($listing) && (string)($listing['ownerId'] ?? '') === $ownerId) $ownedIds[(string)$listing['id']] = true;
    }
    $belongsToOwner = static fn(mixed $item): bool => is_array($item)
        && isset($ownedIds[(string)($item['listingId'] ?? '')]);

    // Public listing data stays available to the owner portal, while account
    // details and activity from other landlords are excluded from the payload.
    $publicUsers = [];
    $contactIds = [];
    foreach (($market['applications'] ?? []) as $item) if ($belongsToOwner($item)) $contactIds[(string)($item['renterId'] ?? '')] = true;
    foreach (($market['users'] ?? []) as $account) {
        if (!is_array($account)) continue;
        $id = (string)($account['id'] ?? '');
        if (($account['role'] ?? '') === 'landlord') {
            $publicUsers[] = array_intersect_key($account, array_flip(['id','name','role','capabilities','status','verified']));
        } elseif (isset($contactIds[$id])) {
            $publicUsers[] = array_intersect_key($account, array_flip(['id','name','role','email','phone']));
        }
    }
    $market['users'] = $publicUsers;
    foreach (['applications','units','leases','paymentIntents','maintenance','messages'] as $collection) {
        $market[$collection] = array_values(array_filter($market[$collection] ?? [], $belongsToOwner));
    }
    $market['reports'] = [];
    $market['reviews'] = array_values(array_filter($market['reviews'] ?? [], $belongsToOwner));
    $market['landlordApplications'] = array_values(array_filter(
        $market['landlordApplications'] ?? [],
        static fn(mixed $item): bool => is_array($item) && (string)($item['userId'] ?? '') === $accountId
    ));
    $market['documents'] = [];
    $market['saved'] = [];
    $market['session'] = ['id' => $ownerId, 'role' => 'landlord'];
    $state['marketplace'] = $market;
    if (!$ownsRootOperations) {
        $state['tenants'] = [];
        $state['units'] = [];
        $state['payments'] = [];
        $state['utilityBills'] = [];
        $state['settings'] = [];
    }
    unset($state['rootExtras']);
    return $state;
}

function mergeOwnerCollection(array $current, array $incoming, callable $belongsToOwner): array
{
    $merged = [];
    $positions = [];
    foreach ($current as $item) {
        if (!is_array($item)) continue;
        $id = textValue($item['id'] ?? '');
        if ($id === '') continue;
        $positions[$id] = count($merged);
        $merged[] = $item;
    }
    foreach ($incoming as $item) {
        if (!is_array($item) || !$belongsToOwner($item)) continue;
        $id = textValue($item['id'] ?? '');
        if ($id === '') continue;
        if (isset($positions[$id])) $merged[$positions[$id]] = $item;
        else { $positions[$id] = count($merged); $merged[] = $item; }
    }
    return $merged;
}

function mergeOwnerRootState(PDO $pdo, string $key, array $current, array $incoming, array $user): array
{
    if ($key !== 'narra-house-prototype-v3' || !is_array($current['marketplace'] ?? null) || !is_array($incoming['marketplace'] ?? null)) return $incoming;
    $ownerId = marketplaceOwnerId($user);
    $oldMarket = $current['marketplace'];
    $newMarket = $incoming['marketplace'];
    $listings = mergeOwnerCollection(
        $oldMarket['listings'] ?? [],
        $newMarket['listings'] ?? [],
        static fn(array $item): bool => (string)($item['ownerId'] ?? '') === $ownerId
    );
    $ownedIds = [];
    $oldListingById = [];
    foreach (($oldMarket['listings'] ?? []) as $item) if (is_array($item)) $oldListingById[textValue($item['id'] ?? '')] = $item;
    foreach ($listings as &$listing) {
        $id = textValue($listing['id'] ?? '');
        if (($oldListingById[$id]['ownerId'] ?? null) === $ownerId) {
            $listing['ownerId'] = $ownerId;
            $listing['verified'] = $oldListingById[$id]['verified'] ?? false;
            $listing['owner'] = $oldListingById[$id]['owner'] ?? ($listing['owner'] ?? '');
        }
        if ((string)($listing['ownerId'] ?? '') === $ownerId) $ownedIds[$id] = true;
    }
    unset($listing);
    $belongsToListing = static fn(array $item): bool => isset($ownedIds[(string)($item['listingId'] ?? '')]);

    $mergedMarket = $oldMarket;
    $mergedMarket['listings'] = $listings;
    $mergedMarket['units'] = mergeOwnerCollection($oldMarket['units'] ?? [], $newMarket['units'] ?? [], $belongsToListing);
    foreach (['applications','messages','maintenance','paymentIntents','leases'] as $collection) {
        $mergedMarket[$collection] = mergeOwnerCollection($oldMarket[$collection] ?? [], $newMarket[$collection] ?? [], $belongsToListing);
    }
    // Admin moderation and private renter activity remain controlled by their owners.
    foreach (['users','saved','reports','reviews','landlordApplications','documents'] as $collection) {
        $mergedMarket[$collection] = $oldMarket[$collection] ?? ($newMarket[$collection] ?? []);
    }
    $incoming['marketplace'] = $mergedMarket;

    // The root operations tables belong to home-narra. A landlord who owns a
    // different marketplace listing must not replace those unrelated records.
    if (!propertyOwnedBy($pdo, 'home-narra', $ownerId)) {
        foreach (['tenants','units','payments','utilityBills','settings'] as $collection) {
            $incoming[$collection] = $current[$collection] ?? [];
        }
        $incoming['rootExtras'] = $current['rootExtras'] ?? [];
    }
    return $incoming;
}

function replaceState(PDO $pdo, string $key, array $data): void
{
    $isRoot = $key === 'narra-house-prototype-v3';
    $hasMarketplace = is_array($data['marketplace'] ?? null);
    $market = $isRoot && is_array($data['marketplace'] ?? null) ? $data['marketplace'] : [];
    $settings = is_array($data['settings'] ?? null) ? $data['settings'] : [];
    $propertyId = $isRoot ? 'home-narra' : substr($key, strlen('room-to-live-operations:'));
    if (!preg_match('/^[a-zA-Z0-9_-]{1,80}$/', $propertyId)) throw new InvalidArgumentException('Invalid property scope.');

    $listingMap = [];
    foreach (($market['listings'] ?? []) as $listing) {
        if (!is_array($listing) || !isset($listing['id'])) continue;
        $id = textValue($listing['id']);
        if (!preg_match('/^[a-zA-Z0-9_-]{1,80}$/', $id)) continue;
        $name = textValue($listing['name'] ?? '', 'Rental property');
        $address = textValue($listing['address'] ?? '');
        $statement = $pdo->prepare('INSERT INTO properties (property_id,property_name,address,is_active,details_json) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE property_name=VALUES(property_name),address=VALUES(address),is_active=VALUES(is_active),details_json=VALUES(details_json)');
        $statement->execute([$id, $name, $address, 1, jsonValue($listing)]);
        $listingMap[$id] = $listing;
    }
    if (!isset($listingMap[$propertyId])) {
        $name = textValue($settings['propertyName'] ?? '', 'Rental property');
        $address = textValue($settings['propertyAddress'] ?? '');
        $statement = $pdo->prepare('INSERT INTO properties (property_id,property_name,address,details_json) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE property_name=VALUES(property_name),address=VALUES(address)');
        $statement->execute([$propertyId, $name, $address, jsonValue(['name' => $name, 'address' => $address])]);
    }

    $scope = $pdo->prepare('INSERT INTO state_scopes (scope_key,property_id,settings_json,is_bootstrapped) VALUES (?,?,?,1) ON DUPLICATE KEY UPDATE property_id=VALUES(property_id),settings_json=VALUES(settings_json),is_bootstrapped=1');
    $scope->execute([$key, $propertyId, jsonValue($settings)]);

    if ($isRoot) {
    // Upsert leases instead of clearing the whole table on every snapshot save.
        if ($hasMarketplace) {
            $users = $market['users'] ?? [];
            $userInsert = $pdo->prepare('INSERT INTO app_users (user_id,username,email,full_name,role,profile_json) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE username=VALUES(username),email=VALUES(email),full_name=VALUES(full_name),role=VALUES(role),profile_json=VALUES(profile_json)');
            foreach ($users as $user) {
                if (!is_array($user) || !isset($user['id'])) continue;
                $userInsert->execute([textValue($user['id']), textValue($user['username'] ?? '') ?: null, textValue($user['email'] ?? '') ?: null, textValue($user['name'] ?? 'User'), textValue($user['role'] ?? 'renter'), jsonValue($user)]);
            }
        }
    }

    $pdo->prepare('DELETE FROM rent_payments WHERE scope_key=?')->execute([$key]);
    $pdo->prepare('DELETE FROM utility_bill_items WHERE scope_key=?')->execute([$key]);
    $pdo->prepare('DELETE FROM utility_bills WHERE scope_key=?')->execute([$key]);
    $pdo->prepare('DELETE FROM tenants WHERE scope_key=?')->execute([$key]);
    // Units can be referenced by leases, so update them in place instead of
    // deleting and recreating rows during a full-state save.
    $unitInsert = $pdo->prepare('INSERT INTO units (scope_key,unit_id,unit_kind,property_id,unit_number,unit_type,floor_label,monthly_rent,capacity,status,description,details_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE unit_kind=VALUES(unit_kind),property_id=VALUES(property_id),unit_number=VALUES(unit_number),unit_type=VALUES(unit_type),floor_label=VALUES(floor_label),monthly_rent=VALUES(monthly_rent),capacity=VALUES(capacity),status=VALUES(status),description=VALUES(description),details_json=VALUES(details_json)');
    $marketUnitInsert = $pdo->prepare('INSERT INTO units (scope_key,unit_id,unit_kind,property_id,unit_number,unit_type,floor_label,monthly_rent,capacity,status,description,details_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE unit_kind=VALUES(unit_kind),property_id=VALUES(property_id),unit_number=VALUES(unit_number),unit_type=VALUES(unit_type),floor_label=VALUES(floor_label),monthly_rent=VALUES(monthly_rent),capacity=VALUES(capacity),status=VALUES(status),description=VALUES(description),details_json=VALUES(details_json)');
    $unitMap = [];
    foreach (($data['units'] ?? []) as $unit) {
        if (!is_array($unit) || !isset($unit['id'])) continue;
        $id = textValue($unit['id']);
        $unitProperty = $propertyId;
        $unitMap[$id] = $unitProperty;
        $unitInsert->execute([$key,$id,'operations',$unitProperty,textValue($unit['number'] ?? $id),textValue($unit['type'] ?? 'Rental unit'),textValue($unit['floor'] ?? '') ?: null,(float)($unit['monthlyRent'] ?? 0),max(1,(int)($unit['capacity'] ?? 1)),textValue($unit['status'] ?? 'Available'),textValue($unit['description'] ?? ''),jsonValue($unit)]);
    }

    if ($isRoot && $hasMarketplace) {
        foreach (($market['units'] ?? []) as $unit) {
            if (!is_array($unit) || !isset($unit['id'], $unit['listingId'])) continue;
            $listingId = textValue($unit['listingId']);
            $id = textValue($unit['id']);
            $unitMap[$id] = $listingId;
            $marketUnitInsert->execute([$key,$id,'marketplace',$listingId,textValue($unit['number'] ?? $id),textValue($unit['type'] ?? 'Rental unit'),textValue($unit['floor'] ?? '') ?: null,(float)($unit['monthlyRent'] ?? 0),max(1,(int)($unit['capacity'] ?? 1)),textValue($unit['status'] ?? 'Available'),textValue($unit['description'] ?? ''),jsonValue($unit)]);
        }
        $leaseInsert = $pdo->prepare('INSERT INTO leases (lease_id,scope_key,property_id,unit_id,renter_id,renter_name,rent_amount,status,start_date,end_date,details_json) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE property_id=VALUES(property_id),unit_id=VALUES(unit_id),renter_id=VALUES(renter_id),renter_name=VALUES(renter_name),rent_amount=VALUES(rent_amount),status=VALUES(status),start_date=VALUES(start_date),end_date=VALUES(end_date),details_json=VALUES(details_json)');
        foreach (($market['leases'] ?? []) as $lease) {
            if (!is_array($lease) || !isset($lease['id'],$lease['listingId'],$lease['unitId'])) continue;
            $renterId = textValue($lease['renterId'] ?? '');
            $leaseInsert->execute([textValue($lease['id']),$key,textValue($lease['listingId']),textValue($lease['unitId']),$renterId !== '' ? $renterId : null,textValue($lease['renterName'] ?? 'Renter'),(float)($lease['rent'] ?? 0),textValue($lease['status'] ?? 'Pending'),nullableDate($lease['startDate'] ?? null),nullableDate($lease['endDate'] ?? null),jsonValue($lease)]);
        }
    }

    $tenantInsert = $pdo->prepare('INSERT INTO tenants (scope_key,tenant_id,property_id,unit_id,first_name,last_name,phone,email,address,move_in_date,status,monthly_rent,details_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
    $tenantIds = [];
    foreach (($data['tenants'] ?? []) as $tenant) {
        if (!is_array($tenant) || !isset($tenant['id'])) continue;
        $id = textValue($tenant['id']);
        $unitId = textValue($tenant['unitId'] ?? '');
        if ($unitId !== '' && !isset($unitMap[$unitId])) continue;
        $name = preg_split('/\s+/', trim(textValue($tenant['firstName'] ?? 'Tenant') . ' ' . textValue($tenant['lastName'] ?? '')));
        $first = textValue($tenant['firstName'] ?? ($name[0] ?? 'Tenant'));
        $last = textValue($tenant['lastName'] ?? implode(' ', array_slice($name, 1)));
        $tenantInsert->execute([$key,$id,$unitMap[$unitId] ?? $propertyId,$unitId ?: null,$first,$last,textValue($tenant['phone'] ?? ''),textValue($tenant['email'] ?? ''),textValue($tenant['address'] ?? ''),nullableDate($tenant['moveInDate'] ?? null),textValue($tenant['status'] ?? 'Active'),(float)($tenant['monthlyRent'] ?? 0),jsonValue($tenant)]);
        $tenantIds[$id] = $tenant;
    }

    $paymentInsert = $pdo->prepare('INSERT INTO rent_payments (scope_key,payment_id,tenant_id,unit_id,billing_month,amount,payment_date,payment_method,reference_code,notes,status,details_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
    foreach (($data['payments'] ?? []) as $payment) {
        if (!is_array($payment) || !isset($payment['id'])) continue;
        $tenantId = textValue($payment['tenantId'] ?? '');
        if (!isset($tenantIds[$tenantId])) continue;
        $unitId = textValue($payment['unitId'] ?? $tenantIds[$tenantId]['unitId'] ?? '');
        if (!isset($unitMap[$unitId])) $unitId = textValue($tenantIds[$tenantId]['unitId'] ?? '');
        if ($unitId === '' || !isset($unitMap[$unitId])) continue;
        $paymentInsert->execute([$key,textValue($payment['id']),$tenantId,$unitId,textValue($payment['billingMonth'] ?? ''),(float)($payment['amount'] ?? 0),nullableDate($payment['paymentDate'] ?? null),textValue($payment['paymentMethod'] ?? ''),textValue($payment['reference'] ?? ''),textValue($payment['notes'] ?? ''),textValue($payment['status'] ?? 'Pending'),jsonValue($payment)]);
    }

    $typeQuery = $pdo->prepare('SELECT utility_type_id FROM utility_types WHERE type_name=?');
    $typeInsert = $pdo->prepare('INSERT INTO utility_types (type_name) VALUES (?)');
    $billInsert = $pdo->prepare('INSERT INTO utility_bills (scope_key,bill_id,tenant_id,unit_id,billing_period,due_date,status,notes,details_json) VALUES (?,?,?,?,?,?,?,?,?)');
    $itemInsert = $pdo->prepare('INSERT INTO utility_bill_items (bill_item_id,scope_key,bill_id,utility_type_id,previous_reading,current_reading,amount,details_json) VALUES (?,?,?,?,?,?,?,?)');
    foreach (($data['utilityBills'] ?? []) as $bill) {
        if (!is_array($bill) || !isset($bill['id'])) continue;
        $tenantId = textValue($bill['tenantId'] ?? '');
        if (!isset($tenantIds[$tenantId])) continue;
        $unitId = textValue($bill['unitId'] ?? $tenantIds[$tenantId]['unitId'] ?? '');
        if (!isset($unitMap[$unitId])) $unitId = textValue($tenantIds[$tenantId]['unitId'] ?? '');
        if ($unitId === '' || !isset($unitMap[$unitId])) continue;
        $billId = textValue($bill['id']);
        $billInsert->execute([$key,$billId,$tenantId,$unitId,textValue($bill['billingPeriod'] ?? ''),nullableDate($bill['dueDate'] ?? null),textValue($bill['status'] ?? 'Unpaid'),textValue($bill['notes'] ?? ''),jsonValue($bill)]);
        $typeName = textValue($bill['type'] ?? 'Other','Other');
        $typeQuery->execute([$typeName]);
        $typeId = $typeQuery->fetchColumn();
        if (!$typeId) {
            $typeInsert->execute([$typeName]);
            $typeId = $pdo->lastInsertId();
        }
        $previous = is_numeric($bill['previousReading'] ?? null) ? $bill['previousReading'] : null;
        $current = is_numeric($bill['currentReading'] ?? null) ? $bill['currentReading'] : null;
        $itemInsert->execute([$billId,$key,$billId,(int)$typeId,$previous,$current,(float)($bill['amount'] ?? 0),jsonValue(['id' => $billId])]);
    }

    if ($isRoot) {
        $marketExtras = $market;
        foreach (['listings','users','units','leases'] as $canonical) unset($marketExtras[$canonical]);
        $rootExtras = $data;
        foreach (['tenants','units','payments','utilityBills','settings','marketplace'] as $canonical) unset($rootExtras[$canonical]);
        $payload = ['rootExtras' => $rootExtras, 'marketExtras' => $marketExtras];
        $savePayload = $pdo->prepare('INSERT INTO platform_payloads (scope_key,payload) VALUES (?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)');
        $savePayload->execute([$key,jsonValue($payload)]);
    } else {
        $savePayload = $pdo->prepare('INSERT INTO platform_payloads (scope_key,payload) VALUES (?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)');
        $savePayload->execute([$key,jsonValue(['rootExtras' => [], 'marketExtras' => []])]);
    }
}

function migrateLegacyState(PDO $pdo): void
{
    $migrationKey = 'legacy-json-state-to-relational-v1';
    $check = $pdo->prepare('SELECT migration_key FROM app_migrations WHERE migration_key=?');
    $check->execute([$migrationKey]);
    if ($check->fetchColumn()) return;

    $table = $pdo->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='app_states'");
    $table->execute();
    if ((int)$table->fetchColumn() > 0) {
        $legacy = $pdo->prepare('SELECT payload FROM app_states WHERE state_key=?');
        $legacy->execute(['narra-house-prototype-v3']);
        $payload = $legacy->fetchColumn();
        if (is_string($payload) && $payload !== '') {
            $state = json_decode($payload, true);
            if (is_array($state)) {
                $pdo->beginTransaction();
                replaceState($pdo, 'narra-house-prototype-v3', $state);
                $pdo->commit();
            }
        }
    }
    $done = $pdo->prepare('INSERT INTO app_migrations (migration_key) VALUES (?)');
    $done->execute([$migrationKey]);
}

try {
    session_set_cookie_params([
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
        'path' => '/',
    ]);
    session_start();
    $pdo = databaseConnection();
    migrateLegacyState($pdo);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'GET') {
        $key = $_GET['key'] ?? '';
        if (!validKey($key)) respond(400, ['error' => 'A valid state key is required.']);
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            if ($key !== 'narra-house-prototype-v3') respond(401, ['error' => 'Sign in to view this property data.']);
            $state = getState($pdo, $key);
            $market = $state['marketplace'] ?? [];
            $publicUsers = [];
            foreach (($market['users'] ?? []) as $account) {
                if (($account['role'] ?? '') !== 'landlord') continue;
                $publicUsers[] = array_intersect_key($account, array_flip(['id','name','role','capabilities','status','verified']));
            }
            respond(200, ['data' => ['marketplace' => [
                'listings' => $market['listings'] ?? [],
                'users' => $publicUsers,
                'units' => $market['units'] ?? [],
            ]]]);
        }
        if (($user['role'] ?? '') === 'landlord' && !ownsStateScope($pdo, $key, $user)) {
            respond(403, ['error' => 'Your account does not manage this property.']);
        }
        if (!in_array($user['role'] ?? '', ['admin','landlord'], true)) {
            if (!in_array($user['role'] ?? '', ['tenant','renter'], true) || $key !== 'narra-house-prototype-v3') {
                respond(403, ['error' => 'Your account cannot view this property data.']);
            }
            $state = getState($pdo, $key) ?? [];
            $market = $state['marketplace'] ?? [];
            $accountId = (string)$user['id'];
            $activityQuery = $pdo->prepare('SELECT activity_json FROM tenant_activity WHERE account_id=?');
            $activityQuery->execute([$accountId]);
            $activity = json_decode((string)($activityQuery->fetchColumn() ?: '{}'), true);
            if (!is_array($activity)) $activity = [];
            $self = null;
            foreach (($market['users'] ?? []) as $account) if (($account['id'] ?? '') === $accountId) { $self = $account; break; }
            $self = array_merge(is_array($self) ? $self : [], ['id' => $accountId, 'name' => $user['name'], 'email' => $user['email'], 'username' => $user['username'], 'role' => 'renter', 'capabilities' => ['renter'], 'status' => 'Active']);
            $publicUsers = [$self];
            foreach (($market['users'] ?? []) as $account) {
                if (($account['role'] ?? '') !== 'landlord') continue;
                $publicUsers[] = array_intersect_key($account, array_flip(['id','name','role','capabilities','status','verified']));
            }
            $leases = array_values(array_filter($market['leases'] ?? [], static fn($lease): bool => is_array($lease) && (string)($lease['renterId'] ?? '') === $accountId));
            $owned = static fn(string $collection, string $field): array => array_values(array_filter($market[$collection] ?? [], static fn($item): bool => is_array($item) && (string)($item[$field] ?? '') === $accountId));
            $ownedMessages = array_values(array_filter($market['messages'] ?? [], static fn($message): bool => is_array($message) && ((string)($message['from'] ?? '') === $accountId || (string)($message['to'] ?? '') === $accountId)));
            $safeMarket = [
                'listings' => $market['listings'] ?? [], 'users' => $publicUsers,
                'units' => $market['units'] ?? [], 'leases' => $leases,
                'applications' => $owned('applications','renterId'), 'saved' => $activity['saved'] ?? [],
                'messages' => $ownedMessages, 'maintenance' => $owned('maintenance','renterId'),
                'paymentIntents' => $owned('paymentIntents','renterId'), 'landlordApplications' => $owned('landlordApplications','userId'),
                'reviews' => $owned('reviews','renterId'), 'session' => ['id' => $accountId, 'name' => $user['name'], 'email' => $user['email'], 'role' => 'renter'],
            ];
            respond(200, ['data' => ['marketplace' => $safeMarket]]);
        }
        $state = getState($pdo, $key);
        if (($user['role'] ?? '') === 'landlord' && is_array($state)) {
            $state = managerViewForOwner($state, marketplaceOwnerId($user), (string)$user['id'], propertyOwnedBy($pdo, 'home-narra', marketplaceOwnerId($user)));
        }
        respond(200, ['data' => $state]);
    }

    if ($method === 'PUT') {
        $user = $_SESSION['user'] ?? null;
        if (!$user) respond(401, ['error' => 'Sign in before saving database changes.']);
        if (!in_array($user['role'] ?? '', ['admin','landlord'], true)) respond(403, ['error' => 'Your account cannot change property operations data.']);
        if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 2_000_000) respond(413, ['error' => 'This save is larger than the allowed limit.']);
        $input = json_decode(file_get_contents('php://input') ?: '', true, 512, JSON_THROW_ON_ERROR);
        $key = $input['key'] ?? null;
        $data = $input['data'] ?? null;
        if (!validKey($key) || !is_array($data)) respond(400, ['error' => 'Provide a valid key and data object.']);
        if (($user['role'] ?? '') === 'landlord' && !ownsStateScope($pdo, $key, $user)) {
            respond(403, ['error' => 'Your account does not manage this property.']);
        }
        foreach (['tenants','units','payments','utilityBills'] as $collection) {
            if (!is_array($data[$collection] ?? null)) respond(400, ['error' => 'The save is incomplete; required property collections are missing.']);
        }
        if (!is_array($data['settings'] ?? null)) respond(400, ['error' => 'The save must include property settings.']);
        if ($key === 'narra-house-prototype-v3') {
            $market = $data['marketplace'] ?? null;
            if (!is_array($market)) respond(400, ['error' => 'The root save must include marketplace data.']);
            foreach (['listings','users','units','leases'] as $collection) {
                if (!is_array($market[$collection] ?? null)) respond(400, ['error' => 'The marketplace save is incomplete.']);
            }
        }
        if (($user['role'] ?? '') === 'landlord' && $key === 'narra-house-prototype-v3') {
            $current = getState($pdo, $key);
            if (!is_array($current)) respond(409, ['error' => 'The property state is not initialized yet.']);
            $data = mergeOwnerRootState($pdo, $key, $current, $data, $user);
        }
        $pdo->beginTransaction();
        replaceState($pdo, $key, $data);
        $pdo->commit();
        respond(200, ['success' => true]);
    }

    header('Allow: GET, PUT');
    respond(405, ['error' => 'Method not allowed.']);
} catch (JsonException $error) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    respond(400, ['error' => 'Invalid JSON request or stored data.']);
} catch (PDOException $error) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log($error->getMessage());
    respond(500, ['error' => 'MySQL save failed. Check the table relationships and api/config.php settings.']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log($error->getMessage());
    respond(500, ['error' => 'The server could not save this state. Check the PHP error log for details.']);
}
