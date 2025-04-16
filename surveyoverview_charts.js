// --- Configuration ---
const dataDir = 'chart_data/'; // Directory where CSV files are stored

async function loadFileContent(filePath, elementId) {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
        console.error(`Element with ID '${elementId}' not found.`);
        return;
    }

    try {
        const response = await fetch(dataDir + filePath);

        if (!response.ok) {
            // Handle HTTP errors (like file not found - 404)
            throw new Error(`HTTP error: ${response.status}. Could not load content.`);
        }

        // Get the file content as text
        const fileText = await response.text();

        // Display the text content in the target element
        // Using textContent is generally safer as it doesn't parse HTML
        targetElement.textContent = fileText;

        console.log(`Successfully loaded content from ${filePath} into #${elementId}`);

    } catch (error) {
        // Handle fetch errors (network issues) or HTTP errors
        console.error('Error loading file content:', error);
        targetElement.textContent = `Error loading file: ${error.message}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Helper function for chart colors
    const chartColors = [
        'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)', 'rgba(83, 102, 255, 0.8)', 'rgba(40, 159, 64, 0.8)',
        'rgba(210, 99, 132, 0.8)', 'rgba(45, 210, 255, 0.8)', 'rgba(255, 130, 50, 0.8)' // Added more colors
    ];

    const chartColorsT1 = 'rgba(54, 162, 235, 0.6)'; // Blue T1
    const chartColorsT2 = 'rgba(255, 99, 132, 0.6)'; // Red T2

    /**
     * Basic CSV parser
     * Assumes comma-separated values, handles simple quotes.
     * Returns array of objects, using the first row as headers.
     * @param {string} text - The CSV text content.
     * @returns {Array<Object>} Parsed data.
     */
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length < 2) return []; // Needs header + at least one data row

        // Basic header parsing (handles simple quotes if present)
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(','); // Simplistic split, may break with commas inside quotes
            if (values.length === headers.length) {
                const entry = {};
                for (let j = 0; j < headers.length; j++) {
                    entry[headers[j]] = values[j].trim().replace(/^"|"$/g, '');
                }
                data.push(entry);
            }
        }
        return data;
    }

    /**
     * Fetches CSV data and creates a Chart.js chart.
     * @param {string} canvasId - The ID of the canvas element.
     * @param {string} chartType - Type of chart ('bar', 'pie', 'doughnut', 'groupedBar').
     * @param {string} csvFilename - Filename of the CSV data source.
     * @param {object} [chartOptions={}] - Optional Chart.js options.
     * @param {boolean} [horizontal=false] - For bar charts, make it horizontal.
     */
    async function createChartFromCSV(canvasId, chartType, csvFilename, chartOptions = {}, horizontal = false) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas element with ID ${canvasId} not found.`);
            return;
        }

        const csvPath = `${dataDir}${csvFilename}`;
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
                 ctx.parentElement.innerHTML += `<p style="color:red;">Error loading data for chart ${canvasId}. Check ${csvPath}.</p>`;
                 return;
            }

            console.log(`Data loaded for ${canvasId}:`, parsedData);

            let config;
            const defaultOptions = {
                responsive: true,
                maintainAspectRatio: true, // Adjust as needed, maybe false for horizontal bars
                plugins: {
                    legend: { display: chartType !== 'pie' && chartType !== 'doughnut' } // Hide legend for single-dataset pie/doughnut
                }
            };

            if (chartType === 'groupedBar') {
                // Expected CSV Headers: label, t1_value, t2_value
                 if (!parsedData[0].hasOwnProperty('label') || !parsedData[0].hasOwnProperty('t1_value') || !parsedData[0].hasOwnProperty('t2_value')) {
                    throw new Error(`CSV ${csvFilename} missing required headers (label, t1_value, t2_value) for groupedBar chart.`);
                 }
                config = {
                    type: 'bar',
                    data: {
                        labels: parsedData.map(row => row.label),
                        datasets: [
                            {
                                label: 'T1 (Historical)',
                                data: parsedData.map(row => parseFloat(row.t1_value) || 0),
                                backgroundColor: chartColorsT1,
                                borderColor: chartColorsT1.replace('0.6', '1'),
                                borderWidth: 1
                            },
                            {
                                label: 'T2 (Current)',
                                data: parsedData.map(row => parseFloat(row.t2_value) || 0),
                                backgroundColor: chartColorsT2,
                                borderColor: chartColorsT2.replace('0.6', '1'),
                                borderWidth: 1
                            }
                        ]
                    },
                    options: { ...defaultOptions, indexAxis: horizontal ? 'y' : 'x', scales: { [horizontal ? 'x' : 'y']: { beginAtZero: true } }, ...chartOptions }
                };
            } else {
                 // Expected CSV Headers: label, value
                 if (!parsedData[0].hasOwnProperty('label') || !parsedData[0].hasOwnProperty('value')) {
                    throw new Error(`CSV ${csvFilename} missing required headers (label, value) for ${chartType} chart.`);
                 }
                config = {
                    type: chartType === 'bar' || chartType === 'pie' || chartType === 'doughnut' ? chartType : 'bar', // Default to bar if type is unknown simple chart
                    data: {
                        labels: parsedData.map(row => row.label),
                        datasets: [{
                            label: canvasId, // Use canvasId as a default label
                            data: parsedData.map(row => parseFloat(row.value) || 0),
                            backgroundColor: chartType === 'pie' || chartType === 'doughnut' ? chartColors.slice(0, parsedData.length) : chartColors[0], // Use multiple colors for pie/doughnut
                            borderColor: chartType === 'bar' ? chartColors[0].replace('0.8', '1') : undefined,
                            borderWidth: chartType === 'bar' ? 1 : undefined
                        }]
                    },
                    options: { ...defaultOptions, indexAxis: horizontal ? 'y' : 'x', scales: (chartType === 'bar' ? { [horizontal ? 'x' : 'y']: { beginAtZero: true } } : {}), ...chartOptions }
                 };
                 // Specific overrides for pie/doughnut legends might be needed
                 if (chartType === 'pie' || chartType === 'doughnut') {
                    config.options.plugins.legend.display = true; // Usually want legend for pie
                 } else if (chartType === 'bar' && !horizontal) {
                    config.options.plugins.legend.display = false; // Hide legend for simple vertical bar
                 } else if (chartType === 'bar' && horizontal) {
                    config.options.plugins.legend.display = false; // Hide legend for simple horizontal bar
                 }
            }

            new Chart(ctx.getContext('2d'), config);
            console.log(`Chart created for ${canvasId}`);

        } catch (error) {
            console.error(`Failed to create chart for ${canvasId}:`, error);
             ctx.parentElement.innerHTML += `<p style="color:red;">Error loading data for chart ${canvasId}: ${error.message}.</p>`;
        }
    }

    // --- Initialize Charts ---
    // Call createChartFromCSV for each question, specifying the correct CSV filename and chart type.
    // Trend charts use 'groupedBar'. Single-select distributions often use 'pie' or 'bar'. Multi-select frequencies use 'bar'.

    // Expected CSV: label,t1_value,t2_value
    createChartFromCSV('chartQ01', 'groupedBar', 'q01.csv');
    loadFileContent('q01.sql', 'q01sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ02', 'pie', 'q02.csv');
    loadFileContent('q02.sql', 'q02sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ03', 'bar', 'q03.csv', {}, true); // Horizontal bar
    loadFileContent('q03.sql', 'q03sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ04', 'bar', 'q04.csv', {}, true); // Horizontal bar
    loadFileContent('q04.sql', 'q04sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ05', 'pie', 'q05.csv');
    loadFileContent('q05.sql', 'q05sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ06', 'bar', 'q06.csv', {}, true); // Horizontal bar
    loadFileContent('q06.sql', 'q06sql');

     // Expected CSV: label,value
    createChartFromCSV('chartQ07', 'pie', 'q07.csv'); // Likert scale
    loadFileContent('q07.sql', 'q07sql');

     // Expected CSV: label,value
    createChartFromCSV('chartQ08', 'pie', 'q08.csv');
    loadFileContent('q08.sql', 'q08sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ09', 'bar', 'q09.csv');
    loadFileContent('q09.sql', 'q09sql');

     // Expected CSV: label,value
    createChartFromCSV('chartQ10', 'bar', 'q10.csv');
    loadFileContent('q10.sql', 'q10sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ11', 'bar', 'q11.csv', {}, true); // Horizontal bar
    loadFileContent('q11.sql', 'q11sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ12', 'bar', 'q12.csv', {}, true); // Horizontal bar
    loadFileContent('q12.sql', 'q12sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ13', 'bar', 'q13_data.csv', {}, true); // Horizontal bar
    loadFileContent('q13.sql', 'q13sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ14', 'bar', 'q14_data.csv', {}, true); // Horizontal bar
    loadFileContent('q14.sql', 'q14sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ15', 'pie', 'q15_data.csv');
    loadFileContent('q15.sql', 'q15sql');

     // Expected CSV: label,value
    createChartFromCSV('chartQ16', 'pie', 'q16_data.csv');
    loadFileContent('q16.sql', 'q16sql');

     // Expected CSV: label,value
    createChartFromCSV('chartQ17', 'pie', 'q17_data.csv');
    loadFileContent('q17.sql', 'q17sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ18', 'bar', 'q18_data.csv', {}, true); // Horizontal bar
    loadFileContent('q18.sql', 'q18sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ19', 'pie', 'q19_data.csv');
    loadFileContent('q19.sql', 'q19sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ20', 'bar', 'q20_data.csv', {}, true); // Horizontal bar]
    loadFileContent('q20.sql', 'q20sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ21', 'bar', 'q21_data.csv', {}, true); // Horizontal bar
    loadFileContent('q21.sql', 'q21sql');

     // Expected CSV: label,t1_value,t2_value
    createChartFromCSV('chartQ22', 'groupedBar', 'q22_trend_data.csv', {}, true); // Horizontal bar
    loadFileContent('q22.sql', 'q22sql');

    // Expected CSV: label,t1_value,t2_value
    createChartFromCSV('chartQ23', 'groupedBar', 'q23_trend_data.csv', {}, true); // Horizontal bar
    loadFileContent('q23.sql', 'q23sql');

    // Expected CSV: label,t1_value,t2_value
    createChartFromCSV('chartQ24', 'groupedBar', 'q24_trend_data.csv');
    loadFileContent('q24.sql', 'q24sql');

    // Expected CSV: label,t1_value,t2_value
    createChartFromCSV('chartQ25', 'groupedBar', 'q25_trend_data.csv');
    loadFileContent('q25.sql', 'q25sql');

    // Expected CSV: label,t1_value,t2_value
    createChartFromCSV('chartQ26', 'groupedBar', 'q26_trend_data.csv');
    loadFileContent('q26.sql', 'q26sql');

    // Expected CSV: label,t1_value,t2_value
    createChartFromCSV('chartQ27', 'groupedBar', 'q27_trend_data.csv');
    loadFileContent('q27.sql', 'q27sql');

    // Expected CSV: label,t1_value,t2_value
    createChartFromCSV('chartQ28', 'groupedBar', 'q28_trend_data.csv');
    loadFileContent('q28.sql', 'q28sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ29', 'bar', 'q29_data.csv', {}, true); // Horizontal bar
    loadFileContent('q29.sql', 'q29sql');

    // Expected CSV: label,value
    createChartFromCSV('chartQ30', 'bar', 'q30_data.csv', {}, true); // Horizontal bar
    loadFileContent('q30.sql', 'q30sql');

});