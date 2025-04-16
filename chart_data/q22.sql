WITH combined_data AS (
    SELECT 'T2_Current' AS survey_period, code FROM answers, UNNEST(q22) AS t(code)
    UNION ALL
    SELECT 'T1_Historical' AS survey_period, code FROM answers_historical, UNNEST(q22) AS t(code)
)
SELECT
    lt.label AS label,
    COUNT(*) FILTER (WHERE cd.survey_period = 'T1_Historical') AS t1_value,
    COUNT(*) FILTER (WHERE cd.survey_period = 'T2_Current') AS t2_value
FROM combined_data cd JOIN q22_lt lt ON cd.code = lt.identifier
GROUP BY label ORDER BY t2_value;