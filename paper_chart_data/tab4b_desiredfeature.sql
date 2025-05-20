SELECT q21lt.label AS "Frequency",
    COUNT(uq21.q21_code) AS "Count"
FROM answers a,
    UNNEST(a.q21) AS uq21(q21_code)
JOIN q21_lt q21lt ON uq21.q21_code = q21lt.identifier
GROUP BY q21lt.label
ORDER BY "Count" DESC, "Frequency" ASC;