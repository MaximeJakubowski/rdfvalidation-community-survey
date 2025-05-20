WITH RespondentAdvancedFeatureUsage AS (
    SELECT a.respondent_id, a.q05,
        NOT array_contains(a.q20, 'no_answer') AS uses_advanced_features
    FROM answers a ),
AggregatedCountsPerFrequency AS (
    SELECT q05lt.label AS frequency_label,
        COUNT(rafu.respondent_id) AS total_respondents_for_frequency,
        SUM(CASE WHEN rafu.uses_advanced_features THEN 1 ELSE 0 END) AS advanced_features_users_count
    FROM RespondentAdvancedFeatureUsage rafu
    JOIN q05_lt q05lt ON rafu.q05 = q05lt.identifier
    GROUP BY q05lt.label )
SELECT q05_master_list.label AS "Frequency",
    COALESCE(agg.total_respondents_for_frequency, 0) AS "Total Respondents",
    COALESCE(agg.advanced_features_users_count, 0) AS "Advanced Features"
FROM q05_lt q05_master_list
LEFT JOIN AggregatedCountsPerFrequency agg ON q05_master_list.label = agg.frequency_label
ORDER BY "Frequency";