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
    var targets = Array.prototype.slice.call(
        document.querySelectorAll(
            'header .intro-text .intro-lead-in, header .intro-text .intro-heading, header .intro-text .btn, section *:not(script):not(style):not(input):not(textarea):not(select):not(option):not(button)'
        )
    );
    if (!targets.length) return;

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        targets.forEach(function(el) { el.classList.add('is-visible'); });
        return;
    }

    document.body.classList.add('has-reveal');

    targets.forEach(function(el, index) {
        el.classList.add('reveal-on-scroll');
        el.style.transitionDelay = '0ms';
    });

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px'
    });

    window.requestAnimationFrame(function() {
        document.body.classList.add('reveal-ready');
        window.requestAnimationFrame(function() {
            targets.forEach(function(el) {
                var rect = el.getBoundingClientRect();
                var isInitiallyVisible = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
                if (isInitiallyVisible) {
                    window.setTimeout(function() {
                        el.classList.add('is-visible');
                    }, 180);
                    return;
                }
                observer.observe(el);
            });
        });
    });
})();

