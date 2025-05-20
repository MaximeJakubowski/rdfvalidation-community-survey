WITH RespondentToolSelections AS (
    SELECT a.respondent_id,
        unnested_tool.tool_code,
        a.q01 AS background_code
    FROM answers a,
        UNNEST(a.q11) AS unnested_tool(tool_code)
    WHERE array_length(a.q11) > 0 ),
ToolBackgroundAggregatedCounts AS (
    SELECT q11lt.label AS tool_name,
        COUNT(DISTINCT CASE WHEN q01lt.label = 'Academia' THEN rs.respondent_id END) AS academia_users,
        COUNT(DISTINCT CASE WHEN q01lt.label = 'Industry' THEN rs.respondent_id END) AS industry_users,
        COUNT(DISTINCT CASE WHEN q01lt.label = 'Both' THEN rs.respondent_id END) AS both_users
    FROM RespondentToolSelections rs
    JOIN q11_lt q11lt ON rs.tool_code = q11lt.identifier
    JOIN q01_lt q01lt ON rs.background_code = q01lt.identifier
    WHERE q01lt.label IN ('Academia', 'Industry', 'Both')
    GROUP BY q11lt.label )
SELECT q11_master_list.label AS "Tool",
    COALESCE(tbc.academia_users, 0) AS "Academia",
    COALESCE(tbc.industry_users, 0) AS "Industry",
    COALESCE(tbc.both_users, 0) AS "Both"
FROM q11_lt q11_master_list 
LEFT JOIN ToolBackgroundAggregatedCounts tbc ON q11_master_list.label = tbc.tool_name
ORDER BY "Tool"; 