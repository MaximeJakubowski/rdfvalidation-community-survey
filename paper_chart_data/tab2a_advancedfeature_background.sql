WITH RespondentFeatureSelections AS (
    SELECT a.respondent_id,
        unnested_feature.feature_code,
        a.q01 AS background_code 
    FROM answers a,
        UNNEST(a.q20) AS unnested_feature(feature_code)
    WHERE array_length(a.q20) > 0 ),
FeatureBackgroundAggregatedCounts AS (
    SELECT q20lt.label AS feature_name, 
        COUNT(DISTINCT CASE WHEN q01lt.label = 'Academia' THEN rs.respondent_id END) AS academia_users,
        COUNT(DISTINCT CASE WHEN q01lt.label = 'Industry' THEN rs.respondent_id END) AS industry_users,
        COUNT(DISTINCT CASE WHEN q01lt.label = 'Both' THEN rs.respondent_id END) AS both_users
    FROM RespondentFeatureSelections rs
    JOIN q20_lt q20lt ON rs.feature_code = q20lt.identifier
    JOIN q01_lt q01lt ON rs.background_code = q01lt.identifier
    WHERE q01lt.label IN ('Academia', 'Industry', 'Both')
    GROUP BY q20lt.label )
SELECT
    q20_master_list.label AS "Advanced Feature",
    COALESCE(fbc.academia_users, 0) AS "Academia",
    COALESCE(fbc.industry_users, 0) AS "Industry",
    COALESCE(fbc.both_users, 0) AS "Both"
FROM q20_lt q20_master_list LEFT JOIN
    FeatureBackgroundAggregatedCounts fbc 
    ON q20_master_list.label = fbc.feature_name
ORDER BY "Advanced Feature"; 