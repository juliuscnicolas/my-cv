// Modern CV Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    let currentViewMode = 'web';
    let exportButtonRef = null;

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function collectTextList(elements) {
        return Array.from(elements)
            .map(element => element.textContent.trim())
            .filter(Boolean);
    }

    function buildProfessionalExportMarkup(options = {}) {
        const exportMode = options.mode || 'uk';
        const profileName = document.querySelector('.name')?.textContent.trim() || '';
        const profileTitle = document.querySelector('.title')?.textContent.trim() || '';
        const profileTagline = document.querySelector('.tagline')?.textContent.trim() || '';
        const summary = document.querySelector('.summary-text')?.textContent.trim() || '';
        const profilePhoto = document.querySelector('.profile-photo img');
        const profilePhotoSrc = profilePhoto?.currentSrc || profilePhoto?.src || '';
        const profilePhotoAlt = profilePhoto?.alt || profileName;

        const contactItems = Array.from(document.querySelectorAll('.contact-info .contact-item')).map(item => ({
            iconClass: item.querySelector('i')?.className || '',
            value: item.querySelector('span, a')?.textContent.trim() || ''
        })).filter(item => item.value);
        const personalInfo = Array.from(document.querySelectorAll('.personal-info-item')).map(item => ({
            iconClass: item.querySelector('i')?.className || '',
            label: item.querySelector('strong')?.textContent.replace(':', '').trim() || '',
            value: item.querySelector('span')?.textContent.trim() || ''
        })).filter(item => item.label && item.value);

        const experiences = Array.from(document.querySelectorAll('.experience-item')).map(item => ({
            title: item.querySelector('.experience-title h3')?.textContent.trim() || '',
            company: item.querySelector('.company')?.textContent.trim() || '',
            date: item.querySelector('.experience-date span')?.textContent.trim() || '',
            details: collectTextList(item.querySelectorAll('.experience-details li')),
            tech: collectTextList(item.querySelectorAll('.tech-stack .tech-tag'))
        })).filter(item => item.title || item.company);

        const skills = Array.from(document.querySelectorAll('.skill-category')).map(item => ({
            heading: item.querySelector('h4')?.textContent.trim() || '',
            values: collectTextList(item.querySelectorAll('.skill-tag'))
        })).filter(item => item.heading && item.values.length);

        const education = Array.from(document.querySelectorAll('.education-item')).map(item => ({
            degree: item.querySelector('.education-title h3')?.textContent.trim() || '',
            school: item.querySelector('.university')?.textContent.trim() || '',
            date: item.querySelector('.education-date span')?.textContent.trim() || '',
            details: item.querySelector('.education-details')?.textContent.trim() || ''
        })).filter(item => item.degree || item.school);

        const certifications = Array.from(document.querySelectorAll('.certification-item')).map(item => ({
            title: item.querySelector('h4')?.textContent.trim() || '',
            details: item.querySelector('p')?.textContent.trim() || '',
            link: item.querySelector('a')?.href || ''
        })).filter(item => item.title);

        const contactMarkup = contactItems
            .map(item => `
                <div class="contact-line">
                    ${item.iconClass ? `<i class="${escapeHtml(item.iconClass)} contact-icon" aria-hidden="true"></i>` : ''}
                    <span>${escapeHtml(item.value)}</span>
                </div>
            `)
            .join('');

        const personalInfoMarkup = personalInfo.length
            ? `
                <section>
                    <h2>Personal Information</h2>
                    <div class="personal-details-grid">
                        ${personalInfo.map(item => `
                            <div class="personal-detail-item">
                                ${item.iconClass ? `<i class="${escapeHtml(item.iconClass)} personal-detail-icon" aria-hidden="true"></i>` : ''}
                                <div>
                                    <p><strong>${escapeHtml(item.label)}:</strong></p>
                                    <p>${escapeHtml(item.value)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `
            : '';

        const experienceMarkup = experiences.map(item => `
            <article class="experience-entry">
                <div class="entry-header">
                    <div>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p class="subtle"><strong>${escapeHtml(item.company)}</strong></p>
                    </div>
                    <p class="date">${escapeHtml(item.date)}</p>
                </div>
                <ul>
                    ${item.details.map(detail => `<li>${escapeHtml(detail)}</li>`).join('')}
                </ul>
                ${item.tech.length ? `<p class="meta"><strong>Tech:</strong> ${escapeHtml(item.tech.join(' | '))}</p>` : ''}
            </article>
        `).join('');

        const skillsMarkup = skills.map(item => `
            <p><strong>${escapeHtml(item.heading)}:</strong> ${escapeHtml(item.values.join(' | '))}</p>
        `).join('');

        const educationMarkup = education.map(item => `
            <article class="education-entry">
                <div class="entry-header">
                    <div>
                        <h3>${escapeHtml(item.degree)}</h3>
                        <p class="subtle"><strong>${escapeHtml(item.school)}</strong></p>
                    </div>
                    <p class="date">${escapeHtml(item.date)}</p>
                </div>
                ${item.details ? `<p>${escapeHtml(item.details)}</p>` : ''}
            </article>
        `).join('');

        const certificationsMarkup = certifications.map(item => {
            const detailsWithoutLink = item.details.replace(/\s*·?\s*View Credential\s*$/i, '').trim();
            const linkPart = item.link ? ` &mdash; <a href="${escapeHtml(item.link)}">${escapeHtml(item.link)}</a>` : '';
            return `<p><strong>${escapeHtml(item.title)}</strong>${detailsWithoutLink ? `, ${escapeHtml(detailsWithoutLink)}` : ''}${linkPart}</p>`;
        }).join('');

        // Personal info rows — UK mode: work-relevant only; PH mode: all except Work Setup; Default: all items
        const workAuthItem = personalInfo.find(i => /work auth/i.test(i.label));
        const availabilityItem = personalInfo.find(i => /availab/i.test(i.label));
        const mobilityItem = personalInfo.find(i => /mobil|setup/i.test(i.label));

        const infoItemsForExport = exportMode === 'default'
            ? personalInfo
            : exportMode === 'ph'
            ? personalInfo.filter(i => !/mobil|setup|work auth|reloc/i.test(i.label))
            : [workAuthItem, availabilityItem, mobilityItem].filter(Boolean);

        const infoSectionHeading = (exportMode === 'default' || exportMode === 'ph') ? 'Personal Information' : 'Additional Information';

        const ukInfoRows = infoItemsForExport
            .filter(Boolean)
            .map(i => `<tr><td class="info-label">${escapeHtml(i.label)}</td><td>${escapeHtml(i.value)}</td></tr>`)
            .join('');

        const ukInfoMarkup = ukInfoRows ? `
            <section>
                <h2>${infoSectionHeading}</h2>
                <table class="info-table">
                    ${ukInfoRows}
                </table>
            </section>` : '';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(profileName)} – CV</title>
    <style>
        * { box-sizing: border-box; }

        @page {
            size: A4;
            margin: 0.7in 0.65in;
        }

        body {
            margin: 0;
            font-family: Arial, "Helvetica Neue", sans-serif;
            color: #111827;
            background: #ffffff;
            line-height: 1.5;
            font-size: 10.5pt;
        }

        .page {
            width: 100%;
            max-width: 8.27in;
            margin: 0 auto;
        }

        /* ── Header ── */
        header {
            border-bottom: 2px solid #111827;
            padding-bottom: 0.14in;
            margin-bottom: 0.16in;
        }

        h1 {
            margin: 0 0 0.03in;
            font-size: 20pt;
            font-weight: 700;
            letter-spacing: 0.01em;
            color: #111827;
        }

        .role-title {
            margin: 0 0 0.1in;
            font-size: 11pt;
            font-weight: 600;
            color: #374151;
        }

        .contact-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 0.06in 0.22in;
            font-size: 9.5pt;
            color: #374151;
        }

        .contact-bar a {
            color: #374151;
            text-decoration: none;
        }

        .contact-sep::before {
            content: '|';
            margin-right: 0.22in;
            color: #9ca3af;
        }

        /* ── Sections ── */
        section {
            margin-bottom: 0.18in;
            page-break-inside: avoid;
        }

        h2 {
            margin: 0 0 0.07in;
            font-size: 9pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.13em;
            color: #111827;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 0.03in;
        }

        p { margin: 0; }
        p + p { margin-top: 0.05in; }

        /* ── Experience / Education entries ── */
        .entry { margin-bottom: 0.13in; }

        .entry-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 0.2in;
        }

        .entry-head h3 {
            margin: 0;
            font-size: 10.5pt;
            font-weight: 700;
        }

        .entry-head .date {
            font-size: 9.5pt;
            color: #374151;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .entry-org {
            font-size: 10pt;
            font-weight: 600;
            color: #374151;
            margin: 0.01in 0 0.04in;
        }

        ul {
            margin: 0.04in 0 0 0.2in;
            padding: 0;
        }

        li { margin-bottom: 0.03in; }

        .tech-line {
            margin-top: 0.04in;
            font-size: 9.5pt;
            color: #374151;
        }

        /* ── Skills ── */
        .skills-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10pt;
        }

        .skills-table td {
            padding: 0.025in 0.1in 0.025in 0;
            vertical-align: top;
        }

        .skills-table td:first-child {
            font-weight: 700;
            white-space: nowrap;
            padding-right: 0.12in;
            width: 1.5in;
            color: #111827;
        }

        /* ── Additional info table ── */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10pt;
        }

        .info-table td {
            padding: 0.025in 0.1in 0.025in 0;
            vertical-align: top;
        }

        .info-label {
            font-weight: 700;
            white-space: nowrap;
            width: 1.6in;
            color: #111827;
        }

        /* ── Certifications ── */
        .cert-entry {
            margin-bottom: 0.06in;
            font-size: 10pt;
        }

        .cert-entry a {
            color: #111827;
            font-size: 9pt;
        }

        /* ── References ── */
        .references-note {
            font-size: 9.5pt;
            color: #374151;
            font-style: italic;
        }

        /* Photo header (Full CV export) */
        .header-inner {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 0.25in;
        }

        .header-text { flex: 1; min-width: 0; }

        .header-photo {
            width: 1.05in;
            height: 1.05in;
            flex-shrink: 0;
            border-radius: 0.06in;
            overflow: hidden;
            border: 1px solid #d1d5db;
        }

        .header-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { max-width: none; }
        }
    </style>
</head>
<body>
<main class="page">

    <header>
        <div class="header-inner">
            <div class="header-text">
                <h1>${escapeHtml(profileName)}</h1>
                <p class="role-title">${escapeHtml(profileTitle)}</p>
                <div class="contact-bar">
                    ${(exportMode === 'ph'
                        ? contactItems
                            .filter(item => !/relocat/i.test(item.value))
                            .map(item => ({
                                ...item,
                                value: /UK:.*\|.*PH:/i.test(item.value)
                                    ? item.value.replace(/^.*\|\s*PH:\s*/i, '').trim()
                                    : item.value
                            }))
                        : contactItems
                    ).map((item, i) => `<span${i > 0 ? ' class="contact-sep"' : ''}>${escapeHtml(item.value)}</span>`).join('')}
                </div>
            </div>
            ${(exportMode === 'default' || exportMode === 'ph') && profilePhotoSrc ? `<div class="header-photo"><img src="${escapeHtml(profilePhotoSrc)}" alt="${escapeHtml(profilePhotoAlt)}"></div>` : ''}
        </div>
    </header>

    <section>
        <h2>Professional Profile</h2>
        <p>${escapeHtml(summary)}</p>
    </section>

    <section>
        <h2>Core Technical Skills</h2>
        <table class="skills-table">
            ${skills.map(s => `<tr><td>${escapeHtml(s.heading)}</td><td>${escapeHtml(s.values.join(', '))}</td></tr>`).join('')}
        </table>
    </section>

    <section>
        <h2>Professional Experience</h2>
        ${experiences.map(item => `
            <div class="entry">
                <div class="entry-head">
                    <h3>${escapeHtml(item.title)}</h3>
                    <span class="date">${escapeHtml(item.date)}</span>
                </div>
                <p class="entry-org">${escapeHtml(item.company)}</p>
                ${item.details.length ? `<ul>${item.details.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>` : ''}
                ${item.tech.length ? `<p class="tech-line"><strong>Technologies:</strong> ${escapeHtml(item.tech.join(', '))}</p>` : ''}
            </div>`).join('')}
    </section>

    <section>
        <h2>Education</h2>
        ${education.map(item => `
            <div class="entry">
                <div class="entry-head">
                    <h3>${escapeHtml(item.degree)}</h3>
                    <span class="date">${escapeHtml(item.date)}</span>
                </div>
                <p class="entry-org">${escapeHtml(item.school)}</p>
                ${item.details ? `<p>${escapeHtml(item.details)}</p>` : ''}
            </div>`).join('')}
    </section>

    <section>
        <h2>Certifications</h2>
        ${certifications.map(item => {
            const detailsClean = item.details.replace(/\s*·?\s*View Credential\s*$/i, '').trim();
            const linkPart = item.link ? ` — <a href="${escapeHtml(item.link)}">${escapeHtml(item.link)}</a>` : '';
            return `<p class="cert-entry"><strong>${escapeHtml(item.title)}</strong>${detailsClean ? ` — ${escapeHtml(detailsClean)}` : ''}${linkPart}</p>`;
        }).join('')}
    </section>

    ${ukInfoMarkup}

    <section>
        <p class="references-note">References available upon request.</p>
    </section>

</main>
<script>
    window.addEventListener('load', function() {
        setTimeout(function() { window.print(); }, 250);
    });
<\/script>
</body>
</html>`;
    }

    async function openProfessionalPrintView(options = {}) {
        return new Promise((resolve, reject) => {
            const existingFrame = document.getElementById('professional-export-frame');
            if (existingFrame) {
                existingFrame.remove();
            }

            const exportFrame = document.createElement('iframe');
            exportFrame.id = 'professional-export-frame';
            exportFrame.style.cssText = `
                position: fixed;
                width: 0;
                height: 0;
                border: 0;
                opacity: 0;
                pointer-events: none;
            `;

            exportFrame.onload = () => {
                const frameWindow = exportFrame.contentWindow;
                if (!frameWindow) {
                    exportFrame.remove();
                    reject(new Error('Unable to access export frame'));
                    return;
                }

                const handleAfterPrint = () => {
                    frameWindow.removeEventListener('afterprint', handleAfterPrint);
                    exportFrame.remove();
                    resolve();
                };

                frameWindow.addEventListener('afterprint', handleAfterPrint);
                frameWindow.focus();
                setTimeout(() => {
                    frameWindow.print();
                }, 150);
            };

            document.body.appendChild(exportFrame);

            const frameDocument = exportFrame.contentDocument;
            if (!frameDocument) {
                exportFrame.remove();
                reject(new Error('Unable to create export document'));
                return;
            }

            frameDocument.open();
            frameDocument.write(buildProfessionalExportMarkup(options));
            frameDocument.close();
        });
    }

    function updateExportButtonState() {
        if (!exportButtonRef) {
            return;
        }

        exportButtonRef.innerHTML = '<i class="fas fa-file-pdf"></i> Export PDF';
        exportButtonRef.title = 'Export a UK-standard CV as a print-ready PDF';
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

        modeButtons.forEach(button => {
            button.addEventListener('click', function() {
                applyViewMode(this.dataset.viewMode);
            });
        });

        applyViewMode('professional');
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
    function showExportChoiceModal() {
        return new Promise((resolve) => {
            const backdrop = document.createElement('div');
            backdrop.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.55);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
            `;

            const modal = document.createElement('div');
            modal.style.cssText = `
                background: #ffffff;
                border-radius: 16px;
                padding: 2rem;
                width: 100%;
                max-width: 460px;
                margin: 1rem;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35);
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            `;

            modal.innerHTML = `
                <p style="font-size:1.1rem;font-weight:700;color:#1e293b;margin:0 0 0.3rem;">Export CV as PDF</p>
                <p style="font-size:0.875rem;color:#64748b;margin:0 0 1.25rem;">Choose the format to export:</p>

                <button data-mode="uk" style="
                    display:flex;align-items:flex-start;gap:0.9rem;
                    width:100%;text-align:left;
                    background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;
                    padding:0.9rem 1rem;cursor:pointer;margin-bottom:0.65rem;
                    font-family:inherit;transition:border-color 0.15s,background 0.15s;
                ">
                    <span style="font-size:1.5rem;line-height:1;margin-top:0.1rem;">&#127468;&#127463;</span>
                    <span>
                        <span style="display:block;font-size:0.92rem;font-weight:700;color:#1e293b;margin-bottom:0.2rem;">UK Standard</span>
                        <span style="display:block;font-size:0.8rem;color:#64748b;line-height:1.45;">No photo or nationality &mdash; follows Equality Act 2010 guidelines. Recommended for UK job applications.</span>
                    </span>
                </button>

                <button data-mode="default" style="
                    display:flex;align-items:flex-start;gap:0.9rem;
                    width:100%;text-align:left;
                    background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;
                    padding:0.9rem 1rem;cursor:pointer;
                    font-family:inherit;transition:border-color 0.15s,background 0.15s;
                ">
                    <span style="font-size:1.5rem;line-height:1;margin-top:0.1rem;">&#128196;</span>
                    <span>
                        <span style="display:block;font-size:0.92rem;font-weight:700;color:#1e293b;margin-bottom:0.2rem;">Full CV</span>
                        <span style="display:block;font-size:0.8rem;color:#64748b;line-height:1.45;">Includes photo, nationality, and all personal details. Suitable for international applications.</span>
                    </span>
                </button>

                <button data-mode="ph" style="
                    display:flex;align-items:flex-start;gap:0.9rem;
                    width:100%;text-align:left;
                    background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;
                    padding:0.9rem 1rem;cursor:pointer;margin-top:0.65rem;
                    font-family:inherit;transition:border-color 0.15s,background 0.15s;
                ">
                    <span style="font-size:1.5rem;line-height:1;margin-top:0.1rem;">&#127477;&#127469;</span>
                    <span>
                        <span style="display:block;font-size:0.92rem;font-weight:700;color:#1e293b;margin-bottom:0.2rem;">PH - CV</span>
                        <span style="display:block;font-size:0.8rem;color:#64748b;line-height:1.45;">Includes photo and PH address. For Philippines employers.</span>
                    </span>
                </button>

                <button data-mode="cancel" style="
                    display:block;width:100%;margin-top:0.9rem;
                    background:none;border:none;font-size:0.82rem;
                    color:#94a3b8;cursor:pointer;padding:0.4rem;
                    font-family:inherit;transition:color 0.15s;
                ">Cancel</button>
            `;

            modal.querySelectorAll('button[data-mode]').forEach(btn => {
                btn.addEventListener('mouseenter', function() {
                    if (this.disabled) return;
                    if (this.dataset.mode !== 'cancel') {
                        this.style.borderColor = '#2563eb';
                        this.style.background = '#eff6ff';
                    } else {
                        this.style.color = '#475569';
                    }
                });
                btn.addEventListener('mouseleave', function() {
                    if (this.disabled) return;
                    if (this.dataset.mode !== 'cancel') {
                        this.style.borderColor = '#e2e8f0';
                        this.style.background = '#f8fafc';
                    } else {
                        this.style.color = '#94a3b8';
                    }
                });
                btn.addEventListener('click', () => {
                    if (btn.disabled) return;
                    backdrop.remove();
                    resolve(btn.dataset.mode === 'cancel' ? null : btn.dataset.mode);
                });
            });

            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) { backdrop.remove(); resolve(null); }
            });

            backdrop.appendChild(modal);
            document.body.appendChild(backdrop);
        });
    }

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
            const choice = await showExportChoiceModal();
            if (!choice) return;

            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';

            try {
                const label = choice === 'uk' ? 'UK Standard CV' : choice === 'ph' ? 'PH CV' : 'Full CV';
                showNotification(`Opening ${label} \u2014 choose Save as PDF to export.`);
                await openProfessionalPrintView({ mode: choice });
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