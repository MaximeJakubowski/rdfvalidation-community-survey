SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a,
    UNNEST(a.q03) AS unnested_q03(model_code)
    JOIN
    q03_lt AS lt 
    ON unnested_q03.model_code = lt.identifier
GROUP BY label;