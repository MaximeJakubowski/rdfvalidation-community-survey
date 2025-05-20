SELECT all_selected_issues.issue_label AS "Issue/Limitation",
    COUNT(*) AS "Count"
FROM ( 
    SELECT q14lt.label AS issue_label
    FROM answers a,
        UNNEST(a.q14) AS unnested_q14(q14_code)
    JOIN q14_lt q14lt ON unnested_q14.q14_code = q14lt.identifier
    UNION ALL 
    SELECT q29lt.label AS issue_label
    FROM answers a,
        UNNEST(a.q29) AS unnested_q29(q29_code)
    JOIN q29_lt q29lt ON unnested_q29.q29_code = q29lt.identifier
) all_selected_issues
GROUP BY
    all_selected_issues.issue_label
ORDER BY "Count" DESC, "Issue/Limitation" ASC;