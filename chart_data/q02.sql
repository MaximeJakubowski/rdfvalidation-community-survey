SELECT lt.label AS label,
    COUNT(a.respondent_id) AS value
FROM answers AS a 
    JOIN q02_lt AS lt 
    ON a.q02 = lt.identifier
GROUP BY label;