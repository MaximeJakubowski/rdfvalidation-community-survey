SELECT q13lt.label AS "Advantage",
    COUNT(unnested_elements.q13_code) AS "Count" 
FROM answers a, 
    UNNEST(a.q13) AS unnested_elements(q13_code) 
JOIN q13_lt q13lt ON unnested_elements.q13_code = q13lt.identifier 
GROUP BY q13lt.label
ORDER BY "Count" DESC, "Advantage" ASC;