SELECT lt.label AS label,
    COUNT(*) AS value
FROM answers AS a
    JOIN q05_lt AS lt 
    ON a.q05 = lt.identifier
GROUP BY label;
