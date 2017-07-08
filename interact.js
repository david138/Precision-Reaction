/**
 * Created by davidslu on 06/07/2017.
 */

$(document).ready(function() {
    $('.start').click(function() {
        startGame();
    });

    $('.restart').click(function() {
        resetGame();
    });

    resizeFooter();

    $(window).resize(function() {
        resizeFooter();
        document.getElementById('gameBoard').width = $('#gameBoard').width();
        document.getElementById('gameBoard').height = $('#gameBoard').height();
    });

    function resizeFooter() {
        $('.footer').height($(window).height() - $('.footer').position().top);
        if ($('.footer').height() < 100) {
            $('.footer').height(100);
        }
    }

});