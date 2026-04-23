// Modern CV Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    let currentViewMode = 'web';
    let exportButtonRef = null;

    function updateExportButtonState() {
        if (!exportButtonRef) {
            return;
        }

        const label = currentViewMode === 'professional'
            ? '<i class="fas fa-file-export"></i> Export Professional PDF'
            : '<i class="fas fa-file-export"></i> Export Web PDF';

        exportButtonRef.innerHTML = label;
        exportButtonRef.title = currentViewMode === 'professional'
            ? 'Export the professional CV layout as PDF'
            : 'Export the web-style CV layout as PDF';
    }

    function applyViewMode(viewMode) {
        currentViewMode = viewMode === 'professional' ? 'professional' : 'web';
        document.body.dataset.viewMode = currentViewMode;

        const modeButtons = document.querySelectorAll('.view-mode-button');
        modeButtons.forEach(button => {
            const isActive = button.dataset.viewMode === currentViewMode;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        try {
            window.localStorage.setItem('cvViewMode', currentViewMode);
        } catch (error) {
            console.log('Unable to persist view mode preference');
        }

        updateExportButtonState();
    }

    function initializeViewModeToggle() {
        const modeButtons = document.querySelectorAll('.view-mode-button');
        if (!modeButtons.length) {
            return;
        }

        modeButtons.forEach(button => {
            button.addEventListener('click', function() {
                applyViewMode(this.dataset.viewMode);
            });
        });

        let savedMode = document.body.dataset.viewMode || 'web';

        try {
            savedMode = window.localStorage.getItem('cvViewMode') || savedMode;
        } catch (error) {
            console.log('Unable to load saved view mode preference');
        }

        applyViewMode(savedMode);
    }

    // Add smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections for scroll animations
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        // Made sections visible by default to fix layout issue
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        // Temporarily disable observer to fix broken layout
        // observer.observe(section);
    });

    // Add hover effects for tech tags
    const techTags = document.querySelectorAll('.tech-tag, .skill-tag');
    techTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) translateY(-2px)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
        });
    });

    // Add click to copy email functionality
    const emailElements = document.querySelectorAll('.contact-item');
    emailElements.forEach(element => {
        const text = element.textContent.trim();
        if (text.includes('@')) {
            element.style.cursor = 'pointer';
            element.title = 'Click to copy email';
            
            element.addEventListener('click', async function() {
                try {
                    await navigator.clipboard.writeText(text);
                    showNotification('Email copied to clipboard!');
                } catch (err) {
                    console.log('Failed to copy email');
                }
            });
        }
    });
    function addExportButton() {
        const exportButton = document.createElement('button');
        exportButton.className = 'export-button';
        exportButton.title = 'Export CV as PDF';
        exportButton.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 20px;
            z-index: 999;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            border: none;
            border-radius: 999px;
            background: var(--primary-color);
            color: white;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: var(--shadow-md);
            transition: var(--transition);
        `;

        exportButtonRef = exportButton;
        updateExportButtonState();

        exportButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = 'var(--shadow-lg)';
        });

        exportButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'var(--shadow-md)';
        });

        exportButton.addEventListener('click', async function() {
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';

            try {
                const exportModeLabel = currentViewMode === 'professional' ? 'professional' : 'web';
                showNotification(`Opening print dialog for the ${exportModeLabel} CV. Choose Save as PDF to export.`);
                await generatePDFSimple();
            } finally {
                this.disabled = false;
                updateExportButtonState();
            }
        });

        document.body.appendChild(exportButton);

        window.addEventListener('beforeprint', function() {
            exportButton.style.display = 'none';
        });

        window.addEventListener('afterprint', function() {
            exportButton.style.display = 'flex';
        });
    }

    // Legacy stubs kept for html2canvas ignoreElements compatibility
    function addPrintButton() {
        const printButton = document.createElement('button');
        printButton.innerHTML = '<i class="fas fa-print"></i> Print CV';
        printButton.className = 'print-button';
        printButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: var(--shadow-md);
            transition: var(--transition);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        printButton.addEventListener('click', function() {
            enhancedPrint();
        });

        printButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = 'var(--shadow-lg)';
        });

        printButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'var(--shadow-md)';
        });

        document.body.appendChild(printButton);

        // Hide print button when printing
        window.addEventListener('beforeprint', function() {
            printButton.style.display = 'none';
        });

        window.addEventListener('afterprint', function() {
            printButton.style.display = 'flex';
        });
    }

    // Add save as PDF button (fallback method)
    function addSaveAsPDFButton() {
        const saveButton = document.createElement('button');
        saveButton.innerHTML = '<i class="fas fa-file-pdf"></i> Save as PDF';
        saveButton.className = 'save-pdf-button';
        saveButton.style.cssText = `
            position: fixed;
            bottom: 140px;
            right: 20px;
            background: #dc2626;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: var(--shadow-md);
            transition: var(--transition);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        saveButton.addEventListener('click', function() {
            // Use browser's print dialog with better instructions
            showNotification('Use Ctrl+P, then select "Save as PDF" for best results');
            setTimeout(() => {
                window.print();
            }, 500);
        });

        saveButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = 'var(--shadow-lg)';
        });

        saveButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'var(--shadow-md)';
        });

        document.body.appendChild(saveButton);

        // Hide save button when printing
        window.addEventListener('beforeprint', function() {
            saveButton.style.display = 'none';
        });

        window.addEventListener('afterprint', function() {
            saveButton.style.display = 'flex';
        });
    }

    // Add download as PDF button with actual PDF generation
    function addDownloadButton() {
        const downloadButton = document.createElement('button');
        downloadButton.innerHTML = '<i class="fas fa-download"></i> Download PDF';
        downloadButton.className = 'download-button';
        downloadButton.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: var(--shadow-md);
            transition: var(--transition);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        downloadButton.addEventListener('click', async function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            this.disabled = true;
            
            try {
                await generateAndDownloadPDF();
                showNotification('PDF downloaded successfully!');
            } catch (error) {
                console.error('Main PDF generation failed:', error);
                try {
                    await generatePDFAlternative();
                    showNotification('PDF downloaded successfully!');
                } catch (fallbackError) {
                    console.error('Alternative PDF generation failed:', fallbackError);
                    showNotification('PDF generation failed. Please use Print to PDF (Ctrl+P) instead.');
                    // Fallback to print dialog
                    setTimeout(() => {
                        window.print();
                    }, 1000);
                }
            } finally {
                this.innerHTML = '<i class="fas fa-download"></i> Download PDF';
                this.disabled = false;
            }
        });

        downloadButton.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = 'var(--shadow-lg)';
            }
        });

        downloadButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'var(--shadow-md)';
        });

        document.body.appendChild(downloadButton);

        // Hide download button when printing
        window.addEventListener('beforeprint', function() {
            downloadButton.style.display = 'none';
        });

        window.addEventListener('afterprint', function() {
            downloadButton.style.display = 'flex';
        });
    }

    // Simple PDF Generation using browser print
    async function generatePDFSimple() {
        return new Promise((resolve) => {
            // Hide buttons during print
            const buttons = document.querySelectorAll('.print-button, .download-button, .save-pdf-button, .fab-container, .export-button, .view-mode-switcher');
            buttons.forEach(btn => btn.style.display = 'none');
            
            // Add print-optimized styles temporarily
            const printStyleSheet = document.createElement('style');
            printStyleSheet.innerHTML = `
                @media print {
                    /* Ensure desktop layout in print */
                    .header-content {
                        display: grid !important;
                        grid-template-columns: 2fr 1fr !important;
                        gap: 1rem !important;
                    }
                    .profile-info { order: initial !important; }
                    .contact-info { order: initial !important; }
                    
                    /* Make sure all sections are visible */
                    .section {
                        opacity: 1 !important;
                        transform: none !important;
                        display: block !important;
                        visibility: visible !important;
                        overflow: visible !important;
                    }
                    
                    /* Ensure proper text wrapping */
                    * {
                        white-space: normal !important;
                        overflow: visible !important;
                        text-overflow: clip !important;
                        word-wrap: break-word !important;
                    }
                }
            `;
            document.head.appendChild(printStyleSheet);
            
            // Set up print listeners
            const handleAfterPrint = () => {
                // Clean up
                if (printStyleSheet && printStyleSheet.parentNode) {
                    printStyleSheet.parentNode.removeChild(printStyleSheet);
                }
                buttons.forEach(btn => btn.style.display = 'flex');
                
                window.removeEventListener('afterprint', handleAfterPrint);
                resolve();
            };
            
            window.addEventListener('afterprint', handleAfterPrint);
            
            // Show instruction and trigger print
            showNotification('Print dialog opened. Use "Save as PDF" or "Microsoft Print to PDF" for best results');
            
            setTimeout(() => {
                window.print();
            }, 500);
        });
    }

    async function createPdfCaptureTarget() {
        const sourceContainer = document.querySelector('.container');
        const captureWrapper = document.createElement('div');
        const captureContainer = sourceContainer.cloneNode(true);

        captureWrapper.style.cssText = `
            position: fixed;
            left: -10000px;
            top: 0;
            background: #ffffff;
            z-index: -1;
            padding: 0;
            margin: 0;
            opacity: 1;
            pointer-events: none;
        `;

        captureContainer.style.margin = '0';
        captureContainer.style.maxWidth = `${sourceContainer.offsetWidth}px`;
        captureContainer.style.width = `${sourceContainer.offsetWidth}px`;
        captureContainer.style.minHeight = 'auto';
        captureContainer.style.boxShadow = 'none';

        const sourceImages = sourceContainer.querySelectorAll('img');
        const captureImages = captureContainer.querySelectorAll('img');

        captureImages.forEach((captureImg, index) => {
            const sourceImg = sourceImages[index];
            if (!sourceImg || !sourceImg.complete || sourceImg.naturalWidth === 0) {
                return;
            }

            try {
                const canvas = document.createElement('canvas');
                canvas.width = sourceImg.naturalWidth;
                canvas.height = sourceImg.naturalHeight;

                const context = canvas.getContext('2d');
                context.drawImage(sourceImg, 0, 0);
                captureImg.src = canvas.toDataURL('image/png');
            } catch (error) {
                console.warn('Unable to inline image for PDF capture:', error);
            }
        });

        captureWrapper.appendChild(captureContainer);
        document.body.appendChild(captureWrapper);

        await new Promise(resolve => setTimeout(resolve, 100));

        return { captureWrapper, captureContainer };
    }

    // PDF Generation function - Using CSS class approach for better html2canvas compatibility
    async function generateAndDownloadPDF() {
        console.log('Starting PDF generation with CSS class approach...');

        if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
            await generatePDFSimple();
            return;
        }

        // Hide action buttons during capture
        const buttons = document.querySelectorAll('.print-button, .download-button, .save-pdf-button, .notification, .fab-container, .view-mode-switcher');
        buttons.forEach(btn => btn.style.display = 'none');

        // Store original scroll position
        const originalScrollY = window.scrollY;
        window.scrollTo(0, 0);

        let captureWrapper;

        try {
            const { jsPDF } = window.jspdf;
            const { captureWrapper: wrapper, captureContainer: container } = await createPdfCaptureTarget();
            captureWrapper = wrapper;

            // Add CSS class for PDF generation (forces dark styles)
            document.body.classList.add('pdf-generation');
            
            // Ensure all content is visible
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
                section.style.display = 'block';
                section.style.visibility = 'visible';
            });

            // Force reflow to ensure CSS takes effect
            container.offsetHeight; 
            
            // Wait for CSS styles to apply properly
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('CSS class applied, starting canvas capture...');
            
            // Capture with optimal settings
            const canvas = await html2canvas(container, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                height: container.scrollHeight,
                width: container.scrollWidth,
                scrollX: 0,
                scrollY: 0,
                logging: true,
                removeContainer: false,
                imageTimeout: 15000,
                ignoreElements: (element) => {
                    return element.classList && (
                        element.classList.contains('print-button') ||
                        element.classList.contains('download-button') ||
                        element.classList.contains('save-pdf-button') ||
                        element.classList.contains('notification') ||
                        element.classList.contains('fab-container') ||
                        element.classList.contains('view-mode-switcher')
                    );
                }
            });

            console.log('Canvas captured, creating PDF...');

            // Create PDF with A4 dimensions
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const margin = 5; // margin in mm

            const imgWidth = pageWidth - (margin * 2);
            const pageContentHeight = pageHeight - (margin * 2);

            // Calculate how many pixels correspond to one page of content
            const scaleFactor = canvas.width / imgWidth; // pixels per mm
            const pageHeightInPx = Math.floor(pageContentHeight * scaleFactor);
            const totalPages = Math.ceil(canvas.height / pageHeightInPx);

            console.log(`Total pages: ${totalPages}, Canvas: ${canvas.width}x${canvas.height}`);

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) pdf.addPage();

                // Create a temporary canvas for this page slice
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                const remainingHeight = canvas.height - (page * pageHeightInPx);
                pageCanvas.height = Math.min(pageHeightInPx, remainingHeight);

                const ctx = pageCanvas.getContext('2d');
                // Draw only the portion for this page
                ctx.drawImage(
                    canvas,
                    0, page * pageHeightInPx,                          // source x, y
                    canvas.width, pageCanvas.height,                    // source width, height
                    0, 0,                                               // dest x, y
                    pageCanvas.width, pageCanvas.height                 // dest width, height
                );

                const pageImgData = pageCanvas.toDataURL('image/png', 0.95);
                const sliceHeight = (pageCanvas.height / scaleFactor);
                pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, sliceHeight);
            }

            // Generate filename with current date
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const filename = `Julius_Oliver_Nicolas_CV_${dateStr}.pdf`;

            // Download the PDF
            pdf.save(filename);
            console.log('PDF downloaded successfully!');

        } catch (error) {
            console.error('PDF generation error:', error);
            throw error;
        } finally {
            // Remove PDF generation CSS class
            document.body.classList.remove('pdf-generation');

            if (captureWrapper && captureWrapper.parentNode) {
                captureWrapper.parentNode.removeChild(captureWrapper);
            }
            
            // Restore scroll position
            window.scrollTo(0, originalScrollY);

            // Show buttons again
            setTimeout(() => {
                buttons.forEach(btn => btn.style.display = 'flex');
            }, 100);
        }
    }

    // Alternative PDF generation method using CSS class approach
    async function generatePDFAlternative() {
        console.log('Starting alternative PDF generation with CSS class approach...');

        if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
            await generatePDFSimple();
            return;
        }

        // Hide action buttons during capture
        const buttons = document.querySelectorAll('.print-button, .download-button, .save-pdf-button, .notification, .fab-container, .view-mode-switcher');
        buttons.forEach(btn => btn.style.display = 'none');

        // Store original scroll position
        const originalScrollY = window.scrollY;
        window.scrollTo(0, 0);

        let captureWrapper;

        try {
            const { jsPDF } = window.jspdf;
            const { captureWrapper: wrapper, captureContainer: container } = await createPdfCaptureTarget();
            captureWrapper = wrapper;

            // Add CSS class for PDF generation
            document.body.classList.add('pdf-generation');

            // Force reflow to ensure CSS takes effect
            container.offsetHeight;

            // Wait for styles to apply
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('CSS class applied, starting alternative canvas capture...');

            // Capture with moderate settings for better compatibility
            const canvas = await html2canvas(container, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                height: container.scrollHeight,
                width: container.scrollWidth,
                scrollX: 0,
                scrollY: 0,
                logging: true,
                removeContainer: false,
                imageTimeout: 12000,
                ignoreElements: (element) => {
                    return element.classList && (
                        element.classList.contains('print-button') ||
                        element.classList.contains('download-button') ||
                        element.classList.contains('save-pdf-button') ||
                        element.classList.contains('notification') ||
                        element.classList.contains('fab-container') ||
                        element.classList.contains('view-mode-switcher')
                    );
                }
            });

            // Process the canvas into PDF using page slicing
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pageWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const margin = 5;

            const imgWidth = pageWidth - (margin * 2);
            const pageContentHeight = pageHeight - (margin * 2);
            const scaleFactor = canvas.width / imgWidth;
            const pageHeightInPx = Math.floor(pageContentHeight * scaleFactor);
            const totalPages = Math.ceil(canvas.height / pageHeightInPx);

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) pdf.addPage();

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                const remainingHeight = canvas.height - (page * pageHeightInPx);
                pageCanvas.height = Math.min(pageHeightInPx, remainingHeight);

                const ctx = pageCanvas.getContext('2d');
                ctx.drawImage(
                    canvas,
                    0, page * pageHeightInPx,
                    canvas.width, pageCanvas.height,
                    0, 0,
                    pageCanvas.width, pageCanvas.height
                );

                const pageImgData = pageCanvas.toDataURL('image/png', 0.9);
                const sliceHeight = (pageCanvas.height / scaleFactor);
                pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, sliceHeight);
            }

            // Generate filename with current date
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const filename = `Julius_Oliver_Nicolas_CV_Alternative_${dateStr}.pdf`;

            // Download the PDF
            pdf.save(filename);
            console.log('Alternative PDF downloaded successfully!');

        } catch (error) {
            console.error('Alternative PDF generation error:', error);
            throw error;
        } finally {
            // Remove PDF generation CSS class
            document.body.classList.remove('pdf-generation');

            if (captureWrapper && captureWrapper.parentNode) {
                captureWrapper.parentNode.removeChild(captureWrapper);
            }
            
            // Restore scroll position
            window.scrollTo(0, originalScrollY);

            // Show buttons again
            setTimeout(() => {
                buttons.forEach(btn => btn.style.display = 'flex');
            }, 100);
        }
    }

    // Enhanced print function with better PDF output
    function enhancedPrint() {
        // Add a special print class for better styling
        document.body.classList.add('printing');
        
        // Hide action buttons
        const buttons = document.querySelectorAll('.print-button, .download-button, .export-button, .view-mode-switcher');
        buttons.forEach(btn => btn.style.display = 'none');
        
        // Trigger print
        window.print();
        
        // Restore after print
        setTimeout(() => {
            document.body.classList.remove('printing');
            buttons.forEach(btn => btn.style.display = 'flex');
        }, 1000);
    }

    // Notification system
    function showNotification(message) {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            font-size: 14px;
            font-weight: 500;
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Add typing effect to the tagline
    function addTypingEffect() {
        const tagline = document.querySelector('.tagline');
        if (tagline) {
            const originalText = tagline.textContent;
            tagline.textContent = '';
            
            let index = 0;
            const typeWriter = setInterval(() => {
                if (index < originalText.length) {
                    tagline.textContent += originalText.charAt(index);
                    index++;
                } else {
                    clearInterval(typeWriter);
                }
            }, 50);
        }
    }

    // Add progress bar for scroll position
    function addScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            z-index: 1000;
            transition: width 0.3s ease;
            width: 0%;
        `;

        document.body.appendChild(progressBar);

        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.offsetHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    // Initialize features
    initializeViewModeToggle();
    addExportButton();
    addScrollProgress();
    
    // Add typing effect with delay
    setTimeout(addTypingEffect, 1000);

    // Add Easter egg - Konami code
    let konamiCode = [];
    const targetCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A

    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > targetCode.length) {
            konamiCode.shift();
        }
        
        if (JSON.stringify(konamiCode) === JSON.stringify(targetCode)) {
            document.body.style.filter = 'hue-rotate(180deg)';
            showNotification('🎉 Easter egg activated! Refresh to reset.');
            konamiCode = [];
        }
    });
    console.log('🚀 Modern CV loaded successfully!');
});