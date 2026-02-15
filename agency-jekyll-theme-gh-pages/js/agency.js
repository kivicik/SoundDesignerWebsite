/*!
 * Start Bootstrap - Agnecy Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-default'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

$('div.modal').on('show.bs.modal', function() {
	var modal = this;
	var hash = modal.id;
	window.location.hash = hash;
	window.onhashchange = function() {
		if (!location.hash){
			$(modal).modal('hide');
		}
	}
});
// Remove legacy middleware option row (A B C) if present in cached/generated pages
$(function() {
    $('#services .col-md-4').filter(function() {
        return $(this).find('h4.service-heading').first().text().trim() === 'Middleware Integration';
    }).each(function() {
        $(this).find('.middleware-icon-options, .middleware-option').remove();
        $(this).find('div, p, span').filter(function() {
            return $(this).text().replace(/\s+/g, ' ').trim() === 'A B C';
        }).remove();
    });
});

