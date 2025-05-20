SELECT qlt.label AS "Data Domain",
    COUNT(unnested_domains.domain_code) AS "Count"
FROM answers a,
    UNNEST(a.q06) AS unnested_domains(domain_code)
    JOIN q06_lt qlt ON unnested_domains.domain_code = qlt.identifier
GROUP BY qlt.label
ORDER BY "Count" DESC, "Data Domain" ASC;