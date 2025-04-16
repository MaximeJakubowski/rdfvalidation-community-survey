SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a
    JOIN q10_lt AS lt 
    ON a.q10 = lt.identifier
GROUP BY label;