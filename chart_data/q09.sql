SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a
    JOIN q09_lt AS lt 
    ON a.q09 = lt.identifier
GROUP BY label;