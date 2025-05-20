WITH current_q23_counts AS (
    SELECT q23lt.label AS tool_label,
        COUNT(q23_code_unnested.code) AS num_2025
    FROM answers a,
        UNNEST(a.q23) AS q23_code_unnested(code) 
    JOIN q23_lt q23lt ON q23_code_unnested.code = q23lt.identifier
    GROUP BY q23lt.label ), 
historical_q23_counts AS (
    SELECT q23lt.label AS tool_label,
        COUNT(q23_code_unnested.code) AS num_2022
    FROM answers_historical ah,
        UNNEST(ah.q23) AS q23_code_unnested(code) 
    JOIN q23_lt q23lt ON q23_code_unnested.code = q23lt.identifier
    GROUP BY q23lt.label )
SELECT q23_labels.label AS "Tool",
    COALESCE(cqc.num_2025, 0) AS "Count 2025",
    COALESCE(hqc.num_2022, 0) AS "Count 2022"
FROM q23_lt q23_labels 
LEFT JOIN current_q23_counts cqc ON q23_labels.label = cqc.tool_label
LEFT JOIN historical_q23_counts hqc ON q23_labels.label = hqc.tool_label
ORDER BY "Tool";