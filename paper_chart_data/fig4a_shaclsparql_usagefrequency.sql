SELECT q17lt.label AS "Frequency",       
    COUNT(a.respondent_id) AS "Count" 
FROM answers a
JOIN q17_lt q17lt ON a.q17 = q17lt.identifier
GROUP BY q17lt.label
ORDER BY "Count" DESC, "Frequency" ASC;