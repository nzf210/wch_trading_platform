ALTER TABLE scanner_signals
    ADD COLUMN schema_version VARCHAR(50) DEFAULT 'v2',
    ADD COLUMN feature_snapshot JSONB DEFAULT '{}',
    ADD COLUMN ttl_ms BIGINT DEFAULT 30000,
    ADD COLUMN dedup_key VARCHAR(255),
    ADD COLUMN provenance JSONB DEFAULT '{}';

UPDATE scanner_signals
SET
    schema_version = COALESCE(schema_version, 'v2'),
    feature_snapshot = COALESCE(feature_snapshot, '{}'::jsonb),
    ttl_ms = COALESCE(ttl_ms, 30000),
    dedup_key = COALESCE(dedup_key, id::text),
    provenance = COALESCE(provenance, jsonb_build_object('source', 'scanner-go', 'version', 'v1'));

ALTER TABLE scanner_signals
    ALTER COLUMN schema_version SET NOT NULL,
    ALTER COLUMN feature_snapshot SET NOT NULL,
    ALTER COLUMN ttl_ms SET NOT NULL,
    ALTER COLUMN dedup_key SET NOT NULL,
    ALTER COLUMN provenance SET NOT NULL;
