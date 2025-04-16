SELECT lt.label AS label, 
    COUNT(*) AS value
FROM answers AS a,
    UNNEST(a.q04) AS unnested_q04(tech_code)
    JOIN
    q04_lt AS lt 
    ON unnested_q04.tech_code = lt.identifier
GROUP BY label