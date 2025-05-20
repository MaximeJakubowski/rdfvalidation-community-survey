SELECT q30lt.label AS "Statement",
    COUNT(uq30.q30_code) AS "Count"
FROM answers a,
     UNNEST(a.q30) AS uq30(q30_code)
JOIN q30_lt q30lt ON uq30.q30_code = q30lt.identifier
GROUP BY q30lt.label
ORDER BY "Count" DESC, "Statement" ASC;