SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a
    JOIN q16_lt AS lt 
    ON a.q16 = lt.identifier
GROUP BY label;