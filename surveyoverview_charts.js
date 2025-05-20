// --- Configuration ---
const dataDir = ''; 

async function loadFileContent(filePath, elementId) {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
        console.error(`Element with ID '${elementId}' not found.`);
        return;
    }

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}. Could not load content from ${filePath}.`);
        }
        const fileText = await response.text();
        targetElement.textContent = fileText;
        console.log(`Successfully loaded content from ${filePath} into #${elementId}`);

    } catch (error) {
        console.error('Error loading file content:', error);
        targetElement.textContent = `Error loading file: ${error.message}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    const chartColors = [
        'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)', 'rgba(83, 102, 255, 0.8)', 'rgba(40, 159, 64, 0.8)',
        'rgba(210, 99, 132, 0.8)', 'rgba(45, 210, 255, 0.8)', 'rgba(255, 130, 50, 0.8)'
    ];

    const chartColorsT1 = 'rgba(54, 162, 235, 0.6)';
    const chartColorsT2 = 'rgba(255, 99, 132, 0.6)';

    function parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = [];
            let currentVal = '';
            let inQuotes = false;
            for (let char of lines[i]) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(currentVal.trim().replace(/^"|"$/g, ''));
                    currentVal = '';
                } else {
                    currentVal += char;
                }
            }
            values.push(currentVal.trim().replace(/^"|"$/g, ''));

            if (values.length === headers.length) {
                const entry = {};
                for (let j = 0; j < headers.length; j++) {
                    entry[headers[j]] = values[j];
                }
                data.push(entry);
            } else {
                console.warn(`Skipping line ${i+1} in CSV due to mismatched column count. Expected ${headers.length}, got ${values.length}. Line: ${lines[i]}`);
            }
        }
        return data;
    }

    async function createChartFromCSV(canvasId, chartType, csvFilename, chartOptions = {}, horizontal = false) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas element with ID ${canvasId} not found.`);
            return;
        }
        const csvPath = csvFilename;
        console.log(`Attempting to load data for ${canvasId} from ${csvPath}`);

        try {
            const response = await fetch(csvPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching ${csvPath}`);
            }
            const csvText = await response.text();
            const parsedData = parseCSV(csvText);

            if (!parsedData || parsedData.length === 0) {
                 console.error(`No data parsed from ${csvPath} for ${canvasId}. Check CSV format.`);
                 if (ctx.parentElement) {
                    ctx.parentElement.innerHTML += `<p style="color:red;">Error loading data for chart ${canvasId}. CSV empty or unreadable from ${csvPath}.</p>`;
                 }
                 return;
            }
            console.log(`Data loaded for ${canvasId}:`, parsedData);

            let config;
            const defaultOptions = {
                responsive: true,
                maintainAspectRatio: true, // Default, will be overridden for pie/doughnut
                plugins: {
                    legend: { display: true }
                }
            };
            
            const headers = Object.keys(parsedData[0]);

            if (chartType === 'groupedBar') { // For original survey charts with t1_value, t2_value
                 if (!parsedData[0].hasOwnProperty('label') || !parsedData[0].hasOwnProperty('t1_value') || !parsedData[0].hasOwnProperty('t2_value')) {
                    throw new Error(`CSV ${csvFilename} missing required headers (label, t1_value, t2_value) for groupedBar chart.`);
                 }
                config = {
                    type: 'bar',
                    data: {
                        labels: parsedData.map(row => row.label),
                        datasets: [
                            {
                                label: headers.includes('t1_label') ? parsedData[0].t1_label : 'T1 (Historical)',
                                data: parsedData.map(row => parseFloat(row.t1_value) || 0),
                                backgroundColor: chartColorsT1,
                                borderColor: chartColorsT1.replace('0.6', '1'),
                                borderWidth: 1
                            },
                            {
                                label: headers.includes('t2_label') ? parsedData[0].t2_label : 'T2 (Current)',
                                data: parsedData.map(row => parseFloat(row.t2_value) || 0),
                                backgroundColor: chartColorsT2,
                                borderColor: chartColorsT2.replace('0.6', '1'),
                                borderWidth: 1
                            }
                        ]
                    },
                    options: { ...defaultOptions, indexAxis: horizontal ? 'y' : 'x', scales: { [horizontal ? 'x' : 'y']: { beginAtZero: true } }, ...chartOptions }
                };
            } else if (chartType === 'groupedBarPaper') { // For paper bar charts (can be single or multi-series)
                if (headers.length < 2) { 
                    throw new Error(`CSV ${csvFilename} needs at least a label column and one value column for groupedBarPaper. Found headers: ${headers.join(', ')}`);
                }
                const labelColumn = headers[0]; 
                const datasets = [];
                for (let k = 1; k < headers.length; k++) { 
                    datasets.push({
                        label: headers[k], 
                        data: parsedData.map(row => parseFloat(row[headers[k]]) || 0),
                        backgroundColor: chartColors[(k - 1) % chartColors.length],
                        borderColor: chartColors[(k - 1) % chartColors.length].replace(/0\.\d+\)/, '1)'),
                        borderWidth: 1
                    });
                }
                config = {
                    type: 'bar',
                    data: {
                        labels: parsedData.map(row => row[labelColumn]),
                        datasets: datasets
                    },
                    options: { 
                        ...defaultOptions, 
                        indexAxis: horizontal ? 'y' : 'x', 
                        scales: { [horizontal ? 'x' : 'y']: { beginAtZero: true } }, 
                        ...chartOptions, 
                        plugins: { 
                            ...defaultOptions.plugins,
                            legend: {display: datasets.length > 1 || horizontal } 
                        } 
                    }
                };
            } else if (chartType === 'pie' || chartType === 'doughnut') { // For all pie/doughnut charts
                let labelKey = 'label';
                let valueKey = 'value';
                let datasetLabel = canvasId; 

                if (headers.length < 2) {
                    throw new Error(`CSV ${csvFilename} must have at least two columns for ${chartType} chart. Found headers: ${headers.join(', ')}`);
                }

                if (csvFilename.includes('paper_chart_data/')) {
                    labelKey = headers[0];
                    valueKey = headers[1];
                    datasetLabel = valueKey; 
                } else {
                    if (!headers.includes('label') || !headers.includes('value')) {
                        throw new Error(`Original survey CSV ${csvFilename} missing required headers ('label', 'value') for ${chartType} chart. Found: ${headers.join(', ')}`);
                    }
                }
                
                if (!parsedData[0].hasOwnProperty(labelKey) || !parsedData[0].hasOwnProperty(valueKey)) {
                     throw new Error(`CSV ${csvFilename} does not have the determined columns for label ('${labelKey}') or value ('${valueKey}'). Headers found: ${headers.join(', ')}`);
                }

                config = {
                    type: chartType,
                    data: {
                        labels: parsedData.map(row => row[labelKey]),
                        datasets: [{
                            label: datasetLabel, 
                            data: parsedData.map(row => parseFloat(row[valueKey]) || 0),
                            backgroundColor: chartColors.slice(0, parsedData.length),
                        }]
                    },
                    options: { 
                        ...defaultOptions,
                        maintainAspectRatio: false, 
                        plugins: {
                            ...defaultOptions.plugins,
                            title: chartOptions.plugins && chartOptions.plugins.title ? chartOptions.plugins.title : { display: false } 
                        }
                    }
                 };
                 config.options.plugins.legend.display = true;
            } else if (chartType === 'bar') { // For simple bar charts from original survey data (qXX.csv)
                 if (!parsedData[0].hasOwnProperty('label') || !parsedData[0].hasOwnProperty('value')) {
                    throw new Error(`Simple bar chart CSV ${csvFilename} (from original survey) missing required headers ('label', 'value'). Found: ${headers.join(', ')}`);
                 }
                config = {
                    type: 'bar',
                    data: {
                        labels: parsedData.map(row => row.label),
                        datasets: [{
                            label: headers.includes('value') ? 'Value' : headers[1], 
                            data: parsedData.map(row => parseFloat(row.value) || 0),
                            backgroundColor: chartColors[0],
                            borderColor: chartColors[0].replace('0.8', '1'),
                            borderWidth: 1
                        }]
                    },
                    options: { 
                        ...defaultOptions, 
                        indexAxis: horizontal ? 'y' : 'x', 
                        scales: { [horizontal ? 'x' : 'y']: { beginAtZero: true } }, 
                        ...chartOptions,
                        plugins: {
                            ...defaultOptions.plugins,
                            legend: {display: false} 
                        }
                    }
                };
                 if (horizontal) {
                    config.options.plugins.legend.display = true; 
                 }
            } else {
                throw new Error(`Unsupported chart type: ${chartType} for ${csvFilename}`);
            }

            new Chart(ctx.getContext('2d'), config);
            console.log(`Chart created for ${canvasId}`);

        } catch (error) {
            console.error(`Failed to create chart for ${canvasId} from ${csvPath}:`, error);
            if (ctx.parentElement) {
                ctx.parentElement.innerHTML += `<p style="color:red;">Error creating chart ${canvasId}: ${error.message}.</p>`;
            }
        }
    }

    async function createTableFromCSV(tableId, csvFilename, sqlQueryId, sqlFilename) {
        const tableElement = document.getElementById(tableId);
        if (!tableElement) {
            console.error(`Table element with ID ${tableId} not found.`);
            return;
        }

        if (sqlQueryId && sqlFilename) {
            await loadFileContent(sqlFilename, sqlQueryId);
        }

        const csvPath = csvFilename;
        try {
            const response = await fetch(csvPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching ${csvPath}`);
            }
            const csvText = await response.text();
            const parsedData = parseCSV(csvText);

            if (!parsedData || parsedData.length === 0) {
                console.error(`No data parsed from ${csvPath} for ${tableId}. Check CSV format.`);
                tableElement.innerHTML = '<thead><tr><th>Error</th></tr></thead><tbody><tr><td>No data found or error in CSV.</td></tr></tbody>';
                return;
            }

            const headers = Object.keys(parsedData[0]);
            let html = '<thead><tr>';
            headers.forEach(header => {
                html += `<th>${header.replace(/_/g, ' ')}</th>`;
            });
            html += '</tr></thead>';

            html += '<tbody>';
            parsedData.forEach(row => {
                html += '<tr>';
                headers.forEach(header => {
                    html += `<td>${row[header]}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody>';

            tableElement.innerHTML = html;
            console.log(`Table created for ${tableId}`);

        } catch (error) {
            console.error(`Failed to create table for ${tableId}:`, error);
            tableElement.innerHTML = `<thead><tr><th>Error</th></tr></thead><tbody><tr><td>Error loading data: ${error.message}</td></tr></tbody>`;
        }
    }


    // Initialize PAPER Charts & Tables
    createChartFromCSV('chartFig1a', 'groupedBarPaper', 'paper_chart_data/fig1a_professional_background.sql.csv', {plugins: {title: {display: true, text: 'Professional Background (2025 vs 2022)'}}});
    loadFileContent('paper_chart_data/fig1a_professional_background.sql', 'fig1asql');

    createChartFromCSV('chartFig1b', 'groupedBarPaper', 'paper_chart_data/fig1b_datadomains.sql.csv', {plugins: {title: {display: true, text: 'Application Domains'}}}, true);
    loadFileContent('paper_chart_data/fig1b_datadomains.sql', 'fig1bsql');

    createChartFromCSV('chartFig1c', 'groupedBarPaper', 'paper_chart_data/fig1c_yearsofexperience.sql.csv', {plugins: {title: {display: true, text: 'Years of Experience by Background'}}});
    loadFileContent('paper_chart_data/fig1c_yearsofexperience.sql', 'fig1csql');

    createChartFromCSV('chartFig1d', 'pie', 'paper_chart_data/fig1d_languagefamiliarity.sql.csv', {plugins: {title: {display: true, text: 'Language Familiarity'}}});
    loadFileContent('paper_chart_data/fig1d_languagefamiliarity.sql', 'fig1dsql');

    createChartFromCSV('chartFig2', 'groupedBarPaper', 'paper_chart_data/fig2_shapecreation.sql.csv', {plugins: {title: {display: true, text: 'Methods for Shape Creation (2025 vs 2022)'}}});
    loadFileContent('paper_chart_data/fig2_shapecreation.sql', 'fig2sql');
    
    createChartFromCSV('chartFig3', 'groupedBarPaper', 'paper_chart_data/fig3_usagefrequency.sql.csv', {plugins: {title: {display: true, text: 'Validation Usage Frequency by Background'}}});
    loadFileContent('paper_chart_data/fig3_usagefrequency.sql', 'fig3sql');

    createChartFromCSV('chartFig4a', 'groupedBarPaper', 'paper_chart_data/fig4a_shaclsparql_usagefrequency.sql.csv', {plugins: {title: {display: true, text: 'SHACL-SPARQL Usage Frequency'}}}, true);
    loadFileContent('paper_chart_data/fig4a_shaclsparql_usagefrequency.sql', 'fig4asql');

    createChartFromCSV('chartFig4b', 'pie', 'paper_chart_data/fig4b_shaclsparql_motivation.sql.csv', {plugins: {title: {display: true, text: 'Motivation for SHACL-SPARQL Use'}}});
    loadFileContent('paper_chart_data/fig4b_shaclsparql_motivation.sql', 'fig4bsql');

    createChartFromCSV('chartFig5', 'pie', 'paper_chart_data/fig5_evolving.sql.csv', {plugins: {title: {display: true, text: 'Methods for Validating Evolving KGs'}}});
    loadFileContent('paper_chart_data/fig5_evolving.sql', 'fig5sql');

    createChartFromCSV('chartFig6a', 'groupedBarPaper', 'paper_chart_data/fig6a_graphsize_performance.sql.csv', {plugins: {title: {display: true, text: 'Graph Size vs. Performance Concerns'}}});
    loadFileContent('paper_chart_data/fig6a_graphsize_performance.sql', 'fig6asql');
    
    createChartFromCSV('chartFig6b', 'groupedBarPaper', 'paper_chart_data/fig6b_usagefrequency_advancedfeatures.sql.csv', {plugins: {title: {display: true, text: 'Usage Frequency vs. Advanced Features Use'}}});
    loadFileContent('paper_chart_data/fig6b_usagefrequency_advancedfeatures.sql', 'fig6bsql');

    createTableFromCSV('tableTab1a', 'paper_chart_data/tab1a_shapeextraction.sql.csv', 'tab1asql', 'paper_chart_data/tab1a_shapeextraction.sql');
    createTableFromCSV('tableTab1b', 'paper_chart_data/tab1b_shaclvalidators.sql.csv', 'tab1bsql', 'paper_chart_data/tab1b_shaclvalidators.sql');
    createTableFromCSV('tableTab2a', 'paper_chart_data/tab2a_advancedfeature_background.sql.csv', 'tab2asql', 'paper_chart_data/tab2a_advancedfeature_background.sql');
    createTableFromCSV('tableTab2b', 'paper_chart_data/tab2b_graphsize.sql.csv', 'tab2bsql', 'paper_chart_data/tab2b_graphsize.sql');
    createTableFromCSV('tableTab3a', 'paper_chart_data/tab3a_advantages.sql.csv', 'tab3asql', 'paper_chart_data/tab3a_advantages.sql');
    createTableFromCSV('tableTab3b', 'paper_chart_data/tab3b_limitations.sql.csv', 'tab3bsql', 'paper_chart_data/tab3b_limitations.sql');
    createTableFromCSV('tableTab4a', 'paper_chart_data/tab4a_validationreport.sql.csv', 'tab4asql', 'paper_chart_data/tab4a_validationreport.sql');
    createTableFromCSV('tableTab4b', 'paper_chart_data/tab4b_desiredfeature.sql.csv', 'tab4bsql', 'paper_chart_data/tab4b_desiredfeature.sql');


    // Initialize OVERVIEW Charts
    createChartFromCSV('chartQ01', 'groupedBar', 'chart_data/q01.csv');
    loadFileContent('chart_data/q01.sql', 'q01sql');
    createChartFromCSV('chartQ02', 'pie', 'chart_data/q02.csv');
    loadFileContent('chart_data/q02.sql', 'q02sql');
    createChartFromCSV('chartQ03', 'bar', 'chart_data/q03.csv', {}, true); 
    loadFileContent('chart_data/q03.sql', 'q03sql');
    createChartFromCSV('chartQ04', 'bar', 'chart_data/q04.csv', {}, true); 
    loadFileContent('chart_data/q04.sql', 'q04sql');
    createChartFromCSV('chartQ05', 'pie', 'chart_data/q05.csv');
    loadFileContent('chart_data/q05.sql', 'q05sql');
    createChartFromCSV('chartQ06', 'bar', 'chart_data/q06.csv', {}, true); 
    loadFileContent('chart_data/q06.sql', 'q06sql');
    createChartFromCSV('chartQ07', 'pie', 'chart_data/q07.csv');
    loadFileContent('chart_data/q07.sql', 'q07sql');
    createChartFromCSV('chartQ08', 'pie', 'chart_data/q08.csv');
    loadFileContent('chart_data/q08.sql', 'q08sql');
    createChartFromCSV('chartQ09', 'bar', 'chart_data/q09.csv'); 
    loadFileContent('chart_data/q09.sql', 'q09sql');
    createChartFromCSV('chartQ10', 'bar', 'chart_data/q10.csv'); 
    loadFileContent('chart_data/q10.sql', 'q10sql');
    createChartFromCSV('chartQ11', 'bar', 'chart_data/q11.csv', {}, true); 
    loadFileContent('chart_data/q11.sql', 'q11sql');
    createChartFromCSV('chartQ12', 'bar', 'chart_data/q12.csv', {}, true); 
    loadFileContent('chart_data/q12.sql', 'q12sql');
    createChartFromCSV('chartQ13', 'bar', 'chart_data/q13.csv', {}, true); 
    loadFileContent('chart_data/q13.sql', 'q13sql');
    createChartFromCSV('chartQ14', 'bar', 'chart_data/q14.csv', {}, true); 
    loadFileContent('chart_data/q14.sql', 'q14sql');
    createChartFromCSV('chartQ15', 'pie', 'chart_data/q15.csv');
    loadFileContent('chart_data/q15.sql', 'q15sql');
    createChartFromCSV('chartQ16', 'pie', 'chart_data/q16.csv');
    loadFileContent('chart_data/q16.sql', 'q16sql');
    createChartFromCSV('chartQ17', 'pie', 'chart_data/q17.csv');
    loadFileContent('chart_data/q17.sql', 'q17sql');
    createChartFromCSV('chartQ18', 'bar', 'chart_data/q18.csv', {}, true); 
    loadFileContent('chart_data/q18.sql', 'q18sql');
    createChartFromCSV('chartQ19', 'pie', 'chart_data/q19.csv');
    loadFileContent('chart_data/q19.sql', 'q19sql');
    createChartFromCSV('chartQ20', 'bar', 'chart_data/q20.csv', {}, true); 
    loadFileContent('chart_data/q20.sql', 'q20sql');
    createChartFromCSV('chartQ21', 'bar', 'chart_data/q21.csv', {}, true); 
    loadFileContent('chart_data/q21.sql', 'q21sql');
    createChartFromCSV('chartQ22', 'groupedBar', 'chart_data/q22.csv', {}, true);
    loadFileContent('chart_data/q22.sql', 'q22sql');
    createChartFromCSV('chartQ23', 'groupedBar', 'chart_data/q23.csv', {}, true);
    loadFileContent('chart_data/q23.sql', 'q23sql');
    createChartFromCSV('chartQ24', 'groupedBar', 'chart_data/q24.csv');
    loadFileContent('chart_data/q24.sql', 'q24sql');
    createChartFromCSV('chartQ25', 'groupedBar', 'chart_data/q25.csv');
    loadFileContent('chart_data/q25.sql', 'q25sql');
    createChartFromCSV('chartQ26', 'groupedBar', 'chart_data/q26.csv');
    loadFileContent('chart_data/q26.sql', 'q26sql');
    createChartFromCSV('chartQ27', 'groupedBar', 'chart_data/q27.csv');
    loadFileContent('chart_data/q27.sql', 'q27sql');
    createChartFromCSV('chartQ28', 'groupedBar', 'chart_data/q28.csv');
    loadFileContent('chart_data/q28.sql', 'q28sql');
    createChartFromCSV('chartQ29', 'bar', 'chart_data/q29.csv', {}, true); 
    loadFileContent('chart_data/q29.sql', 'q29sql');
    createChartFromCSV('chartQ30', 'bar', 'chart_data/q30.csv', {}, true); 
    loadFileContent('chart_data/q30.sql', 'q30sql');
});