SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a,
    UNNEST(a.q12) AS unnested_q(code)
    JOIN q12_lt AS lt 
    ON unnested_q.code = lt.identifier
GROUP BY label
ORDER BY value DESC;