-- Keep the earliest pending report for every reporter/target pair and remove spam duplicates.
WITH ranked_reports AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY reporter_id, target_type, target_id
      ORDER BY created_at ASC, id ASC
    ) AS duplicate_rank
  FROM reports
  WHERE status = 'pending'
)
DELETE FROM reports
WHERE id IN (
  SELECT id FROM ranked_reports WHERE duplicate_rank > 1
);

-- A user may report the same target again only after the prior report has been resolved.
CREATE UNIQUE INDEX IF NOT EXISTS reports_reporter_target_pending_unique
  ON reports (reporter_id, target_type, target_id)
  WHERE status = 'pending';
