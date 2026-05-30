(function($) {

	"use strict";

    $('.navigation').singlePageNav({
        currentClass : 'active',
        offset: 82
    });

    $('.toggle-menu').click(function(){
        $('.responsive-menu').stop(true,true).slideToggle();
        return false;
    });

    $('.menu-toggle').click(function(){
        var isOpen = $('.site-nav').toggleClass('is-open').hasClass('is-open');
        $(this).attr('aria-expanded', isOpen);
        return false;
    });

    $('.site-nav .navigation a').click(function(){
        $('.site-nav').removeClass('is-open');
        $('.menu-toggle').attr('aria-expanded', 'false');
    });

})(jQuery);
