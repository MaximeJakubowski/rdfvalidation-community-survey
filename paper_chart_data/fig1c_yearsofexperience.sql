WITH AnswerDataWithLabels AS (
    SELECT a.respondent_id,
        q01lt.label AS background_label,
        q02lt.label AS experience_label
    FROM answers a
    JOIN q01_lt q01lt ON a.q01 = q01lt.identifier
    JOIN q02_lt q02lt ON a.q02 = q02lt.identifier
    WHERE q01lt.label IN ('Academia', 'Industry', 'Both') ),
AggregatedCountsByExperience AS (
    SELECT experience_label,
        COUNT(CASE WHEN background_label = 'Academia' THEN respondent_id END) AS count_academia,
        COUNT(CASE WHEN background_label = 'Industry' THEN respondent_id END) AS count_industry,
        COUNT(CASE WHEN background_label = 'Both' THEN respondent_id END) AS count_both
    FROM AnswerDataWithLabels
    GROUP BY experience_label )
SELECT q02_ref.label AS "Experience",
    COALESCE(ac.count_academia, 0) AS "Academia",
    COALESCE(ac.count_industry, 0) AS "Industry",
    COALESCE(ac.count_both, 0) AS "Both"
FROM q02_lt q02_ref 
LEFT JOIN AggregatedCountsByExperience ac ON q02_ref.label = ac.experience_label
ORDER BY "Experience";