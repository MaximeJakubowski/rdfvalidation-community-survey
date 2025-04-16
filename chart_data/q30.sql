SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a,
    UNNEST(a.q30) AS unnested_q(code)
    JOIN q30_lt AS lt 
    ON unnested_q.code = lt.identifier
GROUP BY label
ORDER BY value DESC;