WITH RespondentPerformanceFlag AS (
    SELECT a.respondent_id,
        a.q10,
        (array_contains(a.q29, 'performance') OR array_contains(a.q14, 'performance')) AS has_performance_concern
    FROM answers a ),
AggregatedCountsPerGraphSize AS (
    SELECT q10lt.label AS graph_size_label,
        COUNT(rpf.respondent_id) AS total_respondents_in_group,
        SUM(CASE WHEN rpf.has_performance_concern THEN 1 ELSE 0 END) AS performance_concern_count_in_group
    FROM RespondentPerformanceFlag rpf
    JOIN q10_lt q10lt ON rpf.q10 = q10lt.identifier
    GROUP BY q10lt.label )
SELECT q10_master_list.label AS "Graph Size",
    COALESCE(agg.total_respondents_in_group, 0) AS "Total Respondents",
    COALESCE(agg.performance_concern_count_in_group, 0) AS "Performance Concern"
FROM q10_lt q10_master_list
LEFT JOIN AggregatedCountsPerGraphSize agg ON q10_master_list.label = agg.graph_size_label
ORDER BY "Graph Size";