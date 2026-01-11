-- Set phase dates distributed across project timeline
WITH project_data AS (
  SELECT id, estimated_start_date, estimated_end_date,
         COALESCE((estimated_end_date::date - estimated_start_date::date), 90) as total_days
  FROM voltbuild_projects
  WHERE estimated_start_date IS NOT NULL
),
phase_dates AS (
  SELECT p.id, p.project_id, p.order_index,
         COALESCE(pd.estimated_start_date::date, CURRENT_DATE) + (p.order_index * (pd.total_days / GREATEST((SELECT COUNT(*) FROM voltbuild_phases WHERE project_id = p.project_id), 1)))::int as phase_start,
         COALESCE(pd.estimated_start_date::date, CURRENT_DATE) + ((p.order_index + 1) * (pd.total_days / GREATEST((SELECT COUNT(*) FROM voltbuild_phases WHERE project_id = p.project_id), 1)))::int as phase_end
  FROM voltbuild_phases p
  LEFT JOIN project_data pd ON p.project_id = pd.id
)
UPDATE voltbuild_phases SET 
  estimated_start_date = phase_dates.phase_start,
  estimated_end_date = phase_dates.phase_end
FROM phase_dates WHERE voltbuild_phases.id = phase_dates.id;

-- Set task dates within their phase timeframes
WITH phase_data AS (
  SELECT id, 
         COALESCE(estimated_start_date, CURRENT_DATE) as estimated_start_date, 
         COALESCE(estimated_end_date, CURRENT_DATE + 14) as estimated_end_date,
         COALESCE((estimated_end_date::date - estimated_start_date::date), 14) as phase_days
  FROM voltbuild_phases
),
task_counts AS (
  SELECT phase_id, COUNT(*) as task_count FROM voltbuild_tasks GROUP BY phase_id
),
task_dates AS (
  SELECT t.id, t.phase_id, t.order_index,
         pd.estimated_start_date::date + (t.order_index * (pd.phase_days / GREATEST(tc.task_count, 1)))::int as task_start,
         pd.estimated_start_date::date + ((t.order_index + 1) * (pd.phase_days / GREATEST(tc.task_count, 1)))::int as task_end
  FROM voltbuild_tasks t
  JOIN phase_data pd ON t.phase_id = pd.id
  JOIN task_counts tc ON t.phase_id = tc.phase_id
)
UPDATE voltbuild_tasks SET 
  estimated_start_date = task_dates.task_start,
  estimated_end_date = task_dates.task_end
FROM task_dates WHERE voltbuild_tasks.id = task_dates.id;

-- Add sample dependencies (finish-to-start between consecutive tasks in same phase)
INSERT INTO voltbuild_task_dependencies (project_id, predecessor_task_id, successor_task_id, dependency_type, lag_days)
SELECT DISTINCT ON (t2.id)
  p.project_id,
  t1.id as predecessor,
  t2.id as successor,
  'finish_to_start',
  0
FROM voltbuild_tasks t1
JOIN voltbuild_tasks t2 ON t1.phase_id = t2.phase_id 
  AND t2.order_index = t1.order_index + 1
JOIN voltbuild_phases p ON t1.phase_id = p.id
WHERE NOT EXISTS (
  SELECT 1 FROM voltbuild_task_dependencies d 
  WHERE d.predecessor_task_id = t1.id AND d.successor_task_id = t2.id
)
LIMIT 10;

-- Mark first task of each phase as critical path
UPDATE voltbuild_tasks 
SET is_critical_path = true 
WHERE order_index = 0;