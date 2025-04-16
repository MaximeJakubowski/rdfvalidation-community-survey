SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a
    JOIN q19_lt AS lt 
    ON a.q19 = lt.identifier
GROUP BY label
ORDER BY label;