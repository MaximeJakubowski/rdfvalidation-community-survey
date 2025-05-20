WITH current_q22_aggregated_counts AS (
    SELECT q22lt.label AS method_label,
        COUNT(unnested_ans.q22_code) AS num_2025
    FROM answers a,
        UNNEST(a.q22) AS unnested_ans(q22_code)
    JOIN q22_lt q22lt ON unnested_ans.q22_code = q22lt.identifier
    GROUP BY q22lt.label ),
historical_q22_aggregated_counts AS (
    SELECT q22lt.label AS method_label,
        COUNT(unnested_hist.q22_code) AS num_2022
    FROM answers_historical ah,
        UNNEST(ah.q22) AS unnested_hist(q22_code)
    JOIN q22_lt q22lt ON unnested_hist.q22_code = q22lt.identifier
    GROUP BY q22lt.label )
SELECT q22_master_list.label AS "Method",
    COALESCE(curr_counts.num_2025, 0) AS "Count 2025",
    COALESCE(hist_counts.num_2022, 0) AS "Count 2022"
FROM q22_lt q22_master_list
LEFT JOIN current_q22_aggregated_counts curr_counts 
ON q22_master_list.label = curr_counts.method_label
LEFT JOIN historical_q22_aggregated_counts hist_counts 
ON q22_master_list.label = hist_counts.method_label
ORDER BY "Method";