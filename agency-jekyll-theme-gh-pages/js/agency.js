/*!
 * Start Bootstrap - Agnecy Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

(function() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.navbar-default .nav li:not(.hidden) a.page-scroll'));
    var nav = document.querySelector('.navbar-default');
    if (!links.length || !nav) return;
    var CENTER_BAND_TOP_RATIO = 0.35;
    var CENTER_BAND_BOTTOM_RATIO = 0.65;
    var headerSection = document.querySelector('header');
    var homeLink = links.find(function(link) { return link.getAttribute('href') === '#page-top'; }) || null;
    var sectionLinks = links.map(function(link) {
        var href = link.getAttribute('href');
        if (!href || href.charAt(0) !== '#' || href === '#page-top') return null;
        var section = document.querySelector(href);
        if (!section) return null;
        return { link: link, section: section };
    }).filter(Boolean);

    function navHeight() {
        return nav.getBoundingClientRect().height || 0;
    }

    function clearActive() {
        links.forEach(function(link) {
            link.classList.remove('is-active');
            if (link.parentElement) link.parentElement.classList.remove('active');
            link.style.backgroundColor = '';
            link.style.color = '';
            link.style.borderRadius = '';
        });
    }

    function setActive(link) {
        if (!link) return;
        link.classList.add('is-active');
        if (link.parentElement) link.parentElement.classList.add('active');
        link.style.backgroundColor = '#fed136';
        link.style.color = '#fff';
        link.style.borderRadius = '3px';
    }

    function overlapLength(rect, top, bottom) {
        return Math.max(0, Math.min(rect.bottom, bottom) - Math.max(rect.top, top));
    }

    function updateActiveNav() {
        var activeLink = homeLink || links[0] || null;
        var nearBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 6;
        var bandTop = window.innerHeight * CENTER_BAND_TOP_RATIO;
        var bandBottom = window.innerHeight * CENTER_BAND_BOTTOM_RATIO;
        var bestOverlap = -1;

        if (homeLink && headerSection) {
            var headerOverlap = overlapLength(headerSection.getBoundingClientRect(), bandTop, bandBottom);
            if (headerOverlap > bestOverlap) {
                bestOverlap = headerOverlap;
                activeLink = homeLink;
            }
        }

        sectionLinks.forEach(function(item) {
            var sectionOverlap = overlapLength(item.section.getBoundingClientRect(), bandTop, bandBottom);
            if (sectionOverlap >= bestOverlap) {
                bestOverlap = sectionOverlap;
                activeLink = item.link;
            }
        });

        if (nearBottom) {
            var lastLink = (sectionLinks.length ? sectionLinks[sectionLinks.length - 1].link : links[links.length - 1]);
            if (lastLink) activeLink = lastLink;
        }

        clearActive();
        setActive(activeLink);
    }

    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            var href = link.getAttribute('href');
            if (!href || href.charAt(0) !== '#') return;
            var target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            var top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - navHeight());
            if (window.jQuery && window.jQuery.fn && window.jQuery.fn.animate) {
                window.jQuery('html, body').stop(true).animate(
                    { scrollTop: top },
                    650,
                    'swing'
                );
            } else {
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
            clearActive();
            setActive(link);

            if (window.jQuery) {
                window.jQuery('.navbar-toggle:visible').click();
            }
        });
    });

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    window.addEventListener('resize', updateActiveNav);
    window.addEventListener('load', updateActiveNav);
    updateActiveNav();
})();

// Force-enable contact form fields in case global styles/plugins lock interaction.
(function() {
    function unlockContactFields() {
        var fields = document.querySelectorAll('#contact input, #contact textarea, #contact select');
        if (!fields.length) return;
        fields.forEach(function(field) {
            field.removeAttribute('readonly');
            field.removeAttribute('disabled');
            field.style.pointerEvents = 'auto';
            field.style.caretColor = '#f0f0f0';
            field.style.userSelect = 'text';
            field.setAttribute('tabindex', '0');
        });
    }

    document.addEventListener('DOMContentLoaded', unlockContactFields);
    window.addEventListener('load', unlockContactFields);
})();

if (window.jQuery) {
    window.jQuery('div.modal').on('show.bs.modal', function() {
        var modal = this;
        var hash = modal.id;
        window.location.hash = hash;
        window.onhashchange = function() {
            if (!location.hash) {
                window.jQuery(modal).modal('hide');
            }
        };
    });

    window.jQuery('div.modal').on('hidden.bs.modal', function() {
        if (window.location.hash !== '#' + this.id) return;
        if (window.history && window.history.replaceState) {
            window.history.replaceState(
                null,
                document.title,
                window.location.pathname + window.location.search + '#portfolio'
            );
        } else {
            window.location.hash = 'portfolio';
        }
    });

    window.jQuery(function() {
        // If the page is loaded with a modal hash, normalize to portfolio section.
        if (!/^#portfolioModal/i.test(window.location.hash || '')) return;
        var nav = document.querySelector('.navbar-default');
        var portfolio = document.querySelector('#portfolio');
        var offset = nav ? nav.getBoundingClientRect().height : 0;
        if (window.history && window.history.replaceState) {
            window.history.replaceState(
                null,
                document.title,
                window.location.pathname + window.location.search + '#portfolio'
            );
        } else {
            window.location.hash = 'portfolio';
        }
        if (portfolio) {
            var top = Math.max(0, portfolio.getBoundingClientRect().top + window.pageYOffset - offset);
            window.scrollTo(0, top);
        }
    });

    // Remove legacy middleware option row (A B C) if present in cached/generated pages
    window.jQuery(function() {
        window.jQuery('#services .col-md-4').filter(function() {
            return window.jQuery(this).find('h4.service-heading').first().text().trim() === 'Middleware Integration';
        }).each(function() {
            window.jQuery(this).find('.middleware-icon-options, .middleware-option').remove();
            window.jQuery(this).find('div, p, span').filter(function() {
                return window.jQuery(this).text().replace(/\s+/g, ' ').trim() === 'A B C';
            }).remove();
        });
    });
}

(function() {
    var priorityTargets = Array.prototype.slice.call(
        document.querySelectorAll(
            '.navbar-default, .navbar-default .navbar-brand, .navbar-default .nav > li > a, header, header .intro-text .intro-lead-in, header .intro-text .intro-heading, header .intro-text .btn'
        )
    );
    var contentTargets = Array.prototype.slice.call(
        document.querySelectorAll(
            'section *:not(script):not(style):not(input):not(textarea):not(select):not(option):not(button)'
        )
    );
    var targets = priorityTargets.concat(contentTargets);
    if (!targets.length) return;

    function reveal(el) {
        window.requestAnimationFrame(function() {
            el.classList.add('is-visible');
        });
    }

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        document.documentElement.classList.remove('reveal-preload');
        targets.forEach(function(el) { el.classList.add('is-visible'); });
        return;
    }

    document.body.classList.add('has-reveal');
    document.documentElement.classList.remove('reveal-preload');

    targets.forEach(function(el, index) {
        el.classList.remove('reveal-on-scroll');
        el.classList.remove('is-visible');
        el.classList.add('reveal-on-scroll');
        el.style.transitionDelay = '0ms';
    });

    var sectionRevealMap = new Map();
    var revealedSections = new WeakSet();

    contentTargets.forEach(function(el) {
        var section = el.closest('section');
        if (!section) return;
        var list = sectionRevealMap.get(section) || [];
        list.push(el);
        sectionRevealMap.set(section, list);
    });

    function revealSection(section) {
        if (!section || revealedSections.has(section)) return;
        revealedSections.add(section);
        var list = sectionRevealMap.get(section) || [];
        list.forEach(function(el) {
            el.style.transitionDelay = '180ms';
            reveal(el);
        });
    }

    var sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting || entry.intersectionRatio < 1) return;
            var section = entry.target.closest('section');
            revealSection(section);
            sectionObserver.unobserve(entry.target);
        });
    }, {
        threshold: 1,
        rootMargin: '0px'
    });

    window.requestAnimationFrame(function() {
        document.body.classList.add('reveal-ready');
        window.requestAnimationFrame(function() {
            priorityTargets.forEach(function(el) {
                var isHeader = el.matches('header') || !!el.closest('header');
                el.style.transitionDelay = isHeader ? '420ms' : '180ms';
                reveal(el);
            });

            sectionRevealMap.forEach(function(_, section) {
                var trigger = section.querySelector('.section-heading') || section.querySelector('.section-subheading');
                if (!trigger) return;
                var rect = trigger.getBoundingClientRect();
                var isFullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
                if (isFullyVisible) {
                    revealSection(section);
                    return;
                }
                sectionObserver.observe(trigger);
            });
        });
    });
})();

// Save/load editable portfolio modal content in localStorage.
(function() {
    var modals = Array.prototype.slice.call(document.querySelectorAll('.portfolio-modal'));
    if (!modals.length || !window.localStorage) return;

    function keyFor(modalId) {
        return 'portfolioModalContent:' + modalId;
    }

    function getFields(modal) {
        return Array.prototype.slice.call(modal.querySelectorAll('[data-edit-field]'));
    }

    function cleanStoredText(value) {
        if (typeof value !== 'string') return '';
        return value
            .replace(/`r`n/g, ' ')
            .replace(/\\r\\n|\\n|\\r/g, ' ')
            .replace(/\r\n|\n|\r/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function applySaved(modal) {
        if (!modal.id) return;
        var raw = localStorage.getItem(keyFor(modal.id));
        if (!raw) return;
        var data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            return;
        }
        var mutated = false;
        getFields(modal).forEach(function(el) {
            var field = el.getAttribute('data-edit-field');
            if (!field || typeof data[field] !== 'string') return;
            var cleaned = cleanStoredText(data[field]);
            if (cleaned !== data[field]) {
                data[field] = cleaned;
                mutated = true;
            }
            el.textContent = cleaned;
        });
        if (mutated) {
            localStorage.setItem(keyFor(modal.id), JSON.stringify(data));
        }
    }

    function saveModal(modal) {
        if (!modal.id) return false;
        var payload = {};
        getFields(modal).forEach(function(el) {
            var field = el.getAttribute('data-edit-field');
            if (!field) return;
            payload[field] = cleanStoredText(el.textContent || '');
        });
        localStorage.setItem(keyFor(modal.id), JSON.stringify(payload));
        return true;
    }

    modals.forEach(function(modal) {
        applySaved(modal);

        // Prevent accidental navigation while editing contenteditable links.
        Array.prototype.slice.call(modal.querySelectorAll('[data-edit-field][contenteditable="true"]')).forEach(function(link) {
            link.addEventListener('click', function(e) {
                if (link.tagName && link.tagName.toLowerCase() === 'a') {
                    e.preventDefault();
                }
            });
        });

        var saveBtn = modal.querySelector('.modal-save-btn');
        if (!saveBtn) return;

        saveBtn.addEventListener('click', function() {
            var ok = saveModal(modal);
            if (!ok) return;
            var original = saveBtn.textContent;
            saveBtn.textContent = 'Saved';
            window.setTimeout(function() {
                saveBtn.textContent = original;
            }, 900);
        });
    });
})();

