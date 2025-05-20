SELECT q04lt.label AS "Language",
    COUNT(unnested_elements.q04_code) AS "Count"
FROM answers a,
    UNNEST(a.q04) AS unnested_elements(q04_code)
    JOIN q04_lt q04lt ON unnested_elements.q04_code = q04lt.identifier
GROUP BY q04lt.label
ORDER BY "Count" DESC, "Language" ASC;