SELECT q15lt.label AS "Answer",
    COUNT(a.respondent_id) AS "Count"
FROM answers a
JOIN q15_lt q15lt ON a.q15 = q15lt.identifier
GROUP BY q15lt.label
ORDER BY "Count" DESC, "Answer" ASC;