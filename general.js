// Add JavaScript for Expand/Collapse All functionality
document.addEventListener('DOMContentLoaded', () => {
    const expandBtn = document.getElementById('expand-all');
    const collapseBtn = document.getElementById('collapse-all');

    const allSectionDetails = document.querySelectorAll('details.section-details');

    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            allSectionDetails.forEach(detail => {
                detail.open = true;
            });
        });
    }

    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            allSectionDetails.forEach(detail => {
                detail.open = false;
            });
        });
    }

    const copyButtons = document.querySelectorAll('.copy-sql-button');

    copyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); 
            event.stopPropagation(); 

            const targetId = button.getAttribute('data-target');
            const codeElement = document.getElementById(targetId);

            if (codeElement) {
                const textToCopy = codeElement.textContent || codeElement.innerText;

                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.disabled = true; 
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.disabled = false;
                    }, 1500); 
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy SQL. Please copy manually.');
                });
            } else {
                console.error(`Target element with ID '${targetId}' not found for copy button.`);
            }
        });
    });
});
