WITH AnswerDataWithLabels AS (
    SELECT a.respondent_id,
        q10lt.label AS graph_size_label,
        q01lt.label AS background_label
    FROM answers a
    JOIN q10_lt q10lt ON a.q10 = q10lt.identifier
    JOIN q01_lt q01lt ON a.q01 = q01lt.identifier
    WHERE q01lt.label IN ('Academia', 'Industry', 'Both') ),
GraphSizeBackgroundAggregatedCounts AS (
    SELECT graph_size_label,
        COUNT(CASE WHEN background_label = 'Academia' THEN respondent_id END) AS academia_respondents,
        COUNT(CASE WHEN background_label = 'Industry' THEN respondent_id END) AS industry_respondents,
        COUNT(CASE WHEN background_label = 'Both' THEN respondent_id END) AS both_respondents
    FROM AnswerDataWithLabels
    GROUP BY graph_size_label )
SELECT q10_master_list.label AS "Graph Size",
    COALESCE(gsbc.academia_respondents, 0) AS "Academia",
    COALESCE(gsbc.industry_respondents, 0) AS "Industry",
    COALESCE(gsbc.both_respondents, 0) AS "Both"
FROM q10_lt q10_master_list
LEFT JOIN GraphSizeBackgroundAggregatedCounts gsbc ON q10_master_list.label = gsbc.graph_size_label
ORDER BY "Graph Size";