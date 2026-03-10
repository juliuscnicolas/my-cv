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
                console.error('PDF generation failed:', error);
                // Fallback to alternative method
                try {
                    await generatePDFAlternative();
                    showNotification('PDF downloaded successfully (alternative method)!');
                } catch (fallbackError) {
                    console.error('Alternative PDF generation also failed:', fallbackError);
                    showNotification('PDF generation failed. Please use Print to PDF (Ctrl+P).');
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

    // PDF Generation function
    async function generateAndDownloadPDF() {
        // Hide action buttons during capture
        const printButton = document.querySelector('.print-button');
        const downloadButton = document.querySelector('.download-button');
        const progressBar = document.querySelector('div[style*="position: fixed"][style*="top: 0"]');
        
        if (printButton) printButton.style.display = 'none';
        if (downloadButton) downloadButton.style.display = 'none';
        if (progressBar) progressBar.style.display = 'none';

        // Store original scroll position and body styles
        const originalScrollY = window.scrollY;
        const originalBodyStyle = {
            height: document.body.style.height,
            overflow: document.body.style.overflow,
            position: document.body.style.position
        };
        
        // Scroll to top and prepare body for full capture
        window.scrollTo(0, 0);
        document.body.style.height = 'auto';
        document.body.style.overflow = 'visible';
        document.body.style.position = 'static';

        // Temporarily disable animations for better capture
        const originalTransitions = [];
        document.querySelectorAll('*').forEach(el => {
            originalTransitions.push({
                transition: el.style.transition,
                animation: el.style.animation,
                transform: el.style.transform
            });
            el.style.transition = 'none';
            el.style.animation = 'none';
            el.style.transform = 'none';
        });

        // Remove any scroll animations and ensure all content is visible
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        });

        try {
            const { jsPDF } = window.jspdf;
            
            const container = document.querySelector('.container');
            
            // Force container to show all content and calculate proper dimensions
            const originalContainerStyle = {
                height: container.style.height,
                minHeight: container.style.minHeight,
                maxHeight: container.style.maxHeight,
                overflow: container.style.overflow
            };
            
            container.style.height = 'auto';
            container.style.minHeight = 'auto';
            container.style.maxHeight = 'none';
            container.style.overflow = 'visible';
            
            // Wait for layout to settle and measure actual content
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const actualHeight = Math.max(
                container.scrollHeight,
                container.offsetHeight,
                container.clientHeight
            );
            
            const actualWidth = Math.max(
                container.scrollWidth,
                container.offsetWidth,
                container.clientWidth
            );

            console.log(`Capturing container: ${actualWidth}x${actualHeight}`);
            
            // Capture with optimal settings
            const canvas = await html2canvas(container, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                height: actualHeight,
                width: actualWidth,
                scrollX: 0,
                scrollY: 0,
                windowWidth: actualWidth,
                windowHeight: actualHeight,
                x: 0,
                y: 0,
                logging: false,
                removeContainer: false,
                foreignObjectRendering: false,
                imageTimeout: 0,
                onclone: function(clonedDoc) {
                    // Ensure cloned document has proper styles
                    const clonedContainer = clonedDoc.querySelector('.container');
                    if (clonedContainer) {
                        clonedContainer.style.height = 'auto';
                        clonedContainer.style.minHeight = 'auto';
                        clonedContainer.style.overflow = 'visible';
                        clonedContainer.style.position = 'relative';
                    }
                }
            });

            console.log(`Canvas generated: ${canvas.width}x${canvas.height}`);

            // Restore original container style
            Object.assign(container.style, originalContainerStyle);

            // Create PDF with proper A4 dimensions
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const margin = 10; // 10mm margin
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);

            // Calculate scaling to fit content properly
            const canvasAspectRatio = canvas.height / canvas.width;
            const contentAspectRatio = contentHeight / contentWidth;

            let imgWidth, imgHeight;
            if (canvasAspectRatio > contentAspectRatio) {
                // Canvas is taller relative to its width
                imgHeight = contentHeight;
                imgWidth = contentHeight / canvasAspectRatio;
            } else {
                // Canvas is wider relative to its height
                imgWidth = contentWidth;
                imgHeight = contentWidth * canvasAspectRatio;
            }

            const imgData = canvas.toDataURL('image/png', 0.95);
            
            // Center the content on the page
            const xOffset = margin + (contentWidth - imgWidth) / 2;
            const yOffset = margin;

            // Split content across multiple pages if needed
            let remainingHeight = imgHeight;
            let sourceY = 0;
            let isFirstPage = true;

            while (remainingHeight > 0) {
                if (!isFirstPage) {
                    pdf.addPage();
                }

                const pageContentHeight = Math.min(remainingHeight, contentHeight);
                const sourceHeight = (pageContentHeight / imgHeight) * canvas.height;

                // Add the image portion for this page
                pdf.addImage(
                    imgData, 
                    'PNG', 
                    xOffset, 
                    yOffset, 
                    imgWidth, 
                    pageContentHeight,
                    undefined,
                    'FAST',
                    0,
                    sourceY / canvas.height
                );

                remainingHeight -= pageContentHeight;
                sourceY += sourceHeight;
                isFirstPage = false;
            }

            // Generate filename with current date
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const filename = `Julius_Oliver_Nicolas_CV_${dateStr}.pdf`;

            // Download the PDF
            pdf.save(filename);

        } catch (error) {
            console.error('PDF generation error:', error);
            throw error;
        } finally {
            // Restore original styles and scroll position
            document.querySelectorAll('*').forEach((el, index) => {
                const original = originalTransitions[index];
                if (original) {
                    el.style.transition = original.transition || '';
                    el.style.animation = original.animation || '';
                    el.style.transform = original.transform || '';
                }
            });

            // Restore body styles
            Object.assign(document.body.style, originalBodyStyle);

            // Restore scroll position
            window.scrollTo(0, originalScrollY);

            // Show buttons again
            setTimeout(() => {
                if (printButton) printButton.style.display = 'flex';
                if (downloadButton) downloadButton.style.display = 'flex';
                if (progressBar) progressBar.style.display = 'block';
            }, 100);
        }
    }

    // Alternative PDF generation method - captures in sections
    async function generatePDFAlternative() {
        // Hide action buttons during capture
        const printButton = document.querySelector('.print-button');
        const downloadButton = document.querySelector('.download-button');
        const progressBar = document.querySelector('div[style*="position: fixed"][style*="top: 0"]');
        
        if (printButton) printButton.style.display = 'none';
        if (downloadButton) downloadButton.style.display = 'none';
        if (progressBar) progressBar.style.display = 'none';

        // Store original scroll position
        const originalScrollY = window.scrollY;
        window.scrollTo(0, 0);

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const container = document.querySelector('.container');
            
            // Create a clone of the container for manipulation
            const clone = container.cloneNode(true);
            clone.style.position = 'absolute';
            clone.style.top = '0';
            clone.style.left = '-9999px';
            clone.style.width = container.offsetWidth + 'px';
            clone.style.height = 'auto';
            clone.style.minHeight = 'auto';
            clone.style.maxWidth = 'none';
            clone.style.overflow = 'visible';
            
            // Remove all transitions and animations from clone
            clone.querySelectorAll('*').forEach(el => {
                el.style.transition = 'none';
                el.style.animation = 'none';
                el.style.transform = 'none';
                el.style.opacity = '1';
            });

            document.body.appendChild(clone);
            
            // Wait for layout
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capture the clone
            const canvas = await html2canvas(clone, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                height: clone.scrollHeight,
                width: clone.scrollWidth,
                scrollX: 0,
                scrollY: 0,
                logging: false,
                removeContainer: false
            });

            // Remove the clone
            document.body.removeChild(clone);

            // Process the canvas into PDF
            const imgData = canvas.toDataURL('image/png', 0.9);
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add pages
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

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
                if (printButton) printButton.style.display = 'flex';
                if (downloadButton) downloadButton.style.display = 'flex';
                if (progressBar) progressBar.style.display = 'block';
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
    addPrintButton();
    addDownloadButton();
    addSaveAsPDFButton();
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