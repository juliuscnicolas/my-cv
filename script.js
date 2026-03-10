// Modern CV Interactive Features

document.addEventListener('DOMContentLoaded', function() {
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
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
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

    // Add print functionality
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
            const buttons = document.querySelectorAll('.print-button, .download-button, .save-pdf-button');
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

    // PDF Generation function - Simplified and more reliable
    async function generateAndDownloadPDF() {
        // Hide action buttons during capture
        const buttons = document.querySelectorAll('.print-button, .download-button, .save-pdf-button, .notification');
        buttons.forEach(btn => btn.style.display = 'none');

        // Store original scroll position
        const originalScrollY = window.scrollY;
        window.scrollTo(0, 0);

        try {
            const { jsPDF } = window.jspdf;
            const container = document.querySelector('.container');
            
            // Ensure all content is visible
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
                section.style.display = 'block';
                section.style.visibility = 'visible';
            });

            // Wait for layout to settle
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('Starting PDF capture...');
            
            // Capture with optimal settings
            const canvas = await html2canvas(container, {
                scale: 1.5, // Good balance of quality and performance
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                height: container.scrollHeight,
                width: container.scrollWidth,
                scrollX: 0,
                scrollY: 0,
                logging: false,
                removeContainer: false,
                imageTimeout: 10000
            });

            console.log('Canvas captured, creating PDF...');

            // Create PDF with A4 dimensions
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const margin = 10; // margin in mm

            // Calculate dimensions
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasHeight / canvasWidth;

            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = imgWidth * ratio;

            const imgData = canvas.toDataURL('image/png', 0.95);

            // Add image to PDF with page splitting if needed
            let position = 0;
            let heightLeft = imgHeight;
            const pageContentHeight = pageHeight - (margin * 2);

            // First page
            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

            // Add additional pages if content is too tall
            while (heightLeft > pageContentHeight) {
                pdf.addPage();
                position = -(pageContentHeight * (pdf.internal.getNumberOfPages() - 1));
                pdf.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
                heightLeft -= pageContentHeight;
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
            // Restore scroll position
            window.scrollTo(0, originalScrollY);

            // Show buttons again
            setTimeout(() => {
                buttons.forEach(btn => btn.style.display = 'flex');
            }, 100);
        }
    }

    // Alternative PDF generation method - simplified
    async function generatePDFAlternative() {
        // Hide action buttons during capture
        const buttons = document.querySelectorAll('.print-button, .download-button, .save-pdf-button, .notification');
        buttons.forEach(btn => btn.style.display = 'none');

        // Store original scroll position
        const originalScrollY = window.scrollY;
        window.scrollTo(0, 0);

        try {
            const { jsPDF } = window.jspdf;
            const container = document.querySelector('.container');

            // Wait for layout
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capture with moderate settings for better compatibility
            const canvas = await html2canvas(container, {
                scale: 1.2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                height: container.scrollHeight,
                width: container.scrollWidth,
                scrollX: 0,
                scrollY: 0,
                logging: false,
                removeContainer: false
            });

            // Process the canvas into PDF
            const imgData = canvas.toDataURL('image/png', 0.9);
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Generate filename with current date
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const filename = `Julius_Oliver_Nicolas_CV_${dateStr}.pdf`;

            // Download the PDF
            pdf.save(filename);

        } finally {
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
        const buttons = document.querySelectorAll('.print-button, .download-button');
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
    addPrintButton();        // Print CV button
    addDownloadButton();     // Download PDF button (main)
    addSaveAsPDFButton();    // Save as PDF button (fallback)
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

    // Add parallax effect to header
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.header');
        if (header) {
            header.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    console.log('🚀 Modern CV loaded successfully!');
});