SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a
    JOIN q07_lt AS lt 
    ON a.q07 = lt.identifier
GROUP BY label