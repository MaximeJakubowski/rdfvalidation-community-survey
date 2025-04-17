// Add JavaScript for Expand/Collapse All functionality
document.addEventListener('DOMContentLoaded', () => {
    const expandBtn = document.getElementById('expand-all');
    const collapseBtn = document.getElementById('collapse-all');
    // Select only the top-level details elements meant for sections
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

    // Add JavaScript for Copy to Clipboard functionality
    const copyButtons = document.querySelectorAll('.copy-sql-button');

    copyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent details toggling if inside summary
            event.stopPropagation(); // Stop event bubbling up

            const targetId = button.getAttribute('data-target');
            const codeElement = document.getElementById(targetId);

            if (codeElement) {
                const textToCopy = codeElement.textContent || codeElement.innerText; // Get text content

                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Success feedback: change button text temporarily
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.disabled = true; // Optional: disable button briefly
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.disabled = false;
                    }, 1500); // Revert after 1.5 seconds
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    // Optional: Provide error feedback to the user
                    alert('Failed to copy SQL. Please copy manually.');
                });
            } else {
                console.error(`Target element with ID '${targetId}' not found for copy button.`);
            }
        });
    });
});
