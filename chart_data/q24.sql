WITH combined_data AS (
    SELECT 'T2_Current' AS survey_period, q24 FROM answers
    UNION ALL
    SELECT 'T1_Historical' AS survey_period, q24 FROM answers_historical
)
SELECT
    lt.label AS label,
    COUNT(*) FILTER (WHERE cd.survey_period = 'T1_Historical') AS t1_value,
    COUNT(*) FILTER (WHERE cd.survey_period = 'T2_Current') AS t2_value
FROM combined_data cd JOIN q24_lt lt ON cd.q24 = lt.identifier
GROUP BY label;