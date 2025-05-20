WITH current_answer_counts AS (
    SELECT q01, COUNT(respondent_id) AS current_respondent_count
    FROM answers
    GROUP BY q01 ),
historical_answer_counts AS (
    SELECT q01, COUNT(*) AS historical_respondent_count 
    FROM answers_historical
    GROUP BY q01 )
SELECT qlt.label AS "Background",
    COALESCE(cac.current_respondent_count, 0) AS "Count 2025",
    COALESCE(hac.historical_respondent_count, 0) AS "Count 2022"
FROM q01_lt qlt 
LEFT JOIN current_answer_counts cac ON qlt.identifier = cac.q01
LEFT JOIN historical_answer_counts hac ON qlt.identifier = hac.q01
ORDER BY "Count 2025";