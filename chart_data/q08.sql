SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a
    JOIN
    q08_lt AS lt 
    ON a.q08 = lt.identifier
GROUP BY label
ORDER BY label;