SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a
    JOIN q15_lt AS lt 
    ON a.q15 = lt.identifier
GROUP BY label
ORDER BY label, value;