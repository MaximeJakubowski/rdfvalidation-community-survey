SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a
    JOIN q18_lt AS lt 
    ON a.q18 = lt.identifier
GROUP BY label;