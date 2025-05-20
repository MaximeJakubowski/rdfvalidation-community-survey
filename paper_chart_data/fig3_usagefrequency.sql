WITH AnswerDataWithLabels AS (
    SELECT a.respondent_id,
        q05lt.label AS usage_frequency_label,
        q01lt.label AS background_label 
    FROM answers a
    JOIN q05_lt q05lt ON a.q05 = q05lt.identifier
    JOIN q01_lt q01lt ON a.q01 = q01lt.identifier
    WHERE q01lt.label IN ('Academia', 'Industry', 'Both') ),
UsageFrequencyBackgroundAggregatedCounts AS (
    SELECT usage_frequency_label,
        COUNT(CASE WHEN background_label = 'Academia' THEN respondent_id END) AS academia_respondents,
        COUNT(CASE WHEN background_label = 'Industry' THEN respondent_id END) AS industry_respondents,
        COUNT(CASE WHEN background_label = 'Both' THEN respondent_id END) AS both_respondents
    FROM AnswerDataWithLabels
    GROUP BY usage_frequency_label )
SELECT q05_master_list.label AS "Usage Frequency",
    COALESCE(ufbc.academia_respondents, 0) AS "Academia",
    COALESCE(ufbc.industry_respondents, 0) AS "Industry",
    COALESCE(ufbc.both_respondents, 0) AS "Both"
FROM q05_lt q05_master_list 
LEFT JOIN UsageFrequencyBackgroundAggregatedCounts ufbc ON q05_master_list.label = ufbc.usage_frequency_label
ORDER BY "Usage Frequency";