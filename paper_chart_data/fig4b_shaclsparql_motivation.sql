SELECT q18lt.label AS "Frequency",
    COUNT(a.respondent_id) AS "Count"
FROM answers a
JOIN q18_lt q18lt ON a.q18 = q18lt.identifier
GROUP BY q18lt.label
ORDER BY "Count" DESC, "Frequency" ASC;