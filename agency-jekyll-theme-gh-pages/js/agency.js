/*!
 * Start Bootstrap - Agnecy Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

(function() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.navbar-default .nav li a.page-scroll'));
    var nav = document.querySelector('.navbar-default');
    if (!links.length || !nav) return;

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

    function updateActiveNav() {
        var triggerY = navHeight() + Math.max(80, window.innerHeight * 0.22);
        var activeLink = links[0] || null;
        var nearBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 6;

        links.forEach(function(link) {
            var href = link.getAttribute('href');
            if (!href || href.charAt(0) !== '#') return;
            var section = document.querySelector(href);
            if (!section) return;
            if (section.getBoundingClientRect().top <= triggerY) {
                activeLink = link;
            }
        });

        if (nearBottom) {
            var lastLink = links[links.length - 1];
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
            window.scrollTo({ top: target.offsetTop - navHeight(), behavior: 'auto' });
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

