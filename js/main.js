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

    var snakeCanvas = document.querySelector('.credential-snake');

    if (snakeCanvas && snakeCanvas.getContext) {
        var snakeContext = snakeCanvas.getContext('2d');
        var desktopSnakeQuery = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)');
        var snakeDpr = 1;
        var snakeWidth = 0;
        var snakeHeight = 0;
        var snakeRunning = false;
        var snakeFrame = null;
        var snakeTarget = { x: 0, y: 0, active: false };
        var snakeSegments = [];
        var snakeCount = 28;

        function clamp(value, min, max) {
            return Math.min(max, Math.max(min, value));
        }

        function supportsSnake() {
            return desktopSnakeQuery.matches;
        }

        function resetSnakeSegments() {
            snakeSegments = [];
            for (var i = 0; i < snakeCount; i++) {
                snakeSegments.push({
                    x: snakeWidth * 0.5 - (i * 12),
                    y: Math.max(130, snakeHeight * 0.18) + Math.sin(i * 0.8) * 18
                });
            }
            snakeTarget.x = snakeWidth * 0.5;
            snakeTarget.y = Math.max(130, snakeHeight * 0.18);
        }

        function resizeSnake() {
            var docElement = document.documentElement;
            var body = document.body;
            snakeDpr = Math.min(window.devicePixelRatio || 1, 1.5);
            snakeWidth = Math.max(1, Math.round(Math.max(docElement.scrollWidth, body ? body.scrollWidth : 0, docElement.clientWidth)));
            snakeHeight = Math.max(1, Math.round(Math.max(docElement.scrollHeight, body ? body.scrollHeight : 0, docElement.clientHeight)));
            snakeCanvas.width = Math.round(snakeWidth * snakeDpr);
            snakeCanvas.height = Math.round(snakeHeight * snakeDpr);
            snakeCanvas.style.width = snakeWidth + 'px';
            snakeCanvas.style.height = snakeHeight + 'px';
            snakeContext.setTransform(snakeDpr, 0, 0, snakeDpr, 0, 0);
            resetSnakeSegments();
        }

        function setSnakeTarget(event) {
            var x = event.pageX;
            var y = event.pageY;
            snakeTarget.active = x >= 0 && x <= snakeWidth && y >= 0 && y <= snakeHeight;
            if (snakeTarget.active) {
                snakeTarget.x = x;
                snakeTarget.y = y;
            }
        }

        function drawSnake(time) {
            if (!snakeRunning) {
                return;
            }

            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
            var viewportCenter = scrollTop + (window.innerHeight * 0.46);
            var idleY = clamp(viewportCenter + Math.sin(time * 0.0014) * 42, 90, snakeHeight - 90);
            var idleX = clamp(snakeWidth * 0.5 + Math.cos(time * 0.0009) * snakeWidth * 0.32, 120, snakeWidth - 120);
            var nextX = snakeTarget.active ? snakeTarget.x : idleX;
            var nextY = snakeTarget.active ? snakeTarget.y : idleY;
            var head = snakeSegments[0];
            var followSpeed = snakeTarget.active ? 0.2 : 0.045;

            head.x += (nextX - head.x) * followSpeed;
            head.y += (nextY - head.y) * followSpeed;

            for (var i = 1; i < snakeSegments.length; i++) {
                snakeSegments[i].x += (snakeSegments[i - 1].x - snakeSegments[i].x) * 0.24;
                snakeSegments[i].y += (snakeSegments[i - 1].y - snakeSegments[i].y) * 0.24;
            }

            snakeContext.clearRect(0, 0, snakeWidth, snakeHeight);
            snakeContext.lineCap = 'round';
            snakeContext.lineJoin = 'round';
            snakeContext.globalCompositeOperation = 'lighter';
            snakeContext.beginPath();
            snakeContext.moveTo(snakeSegments[0].x, snakeSegments[0].y);
            for (var p = 1; p < snakeSegments.length; p++) {
                snakeContext.lineTo(snakeSegments[p].x, snakeSegments[p].y);
            }
            snakeContext.shadowColor = 'rgba(141, 240, 198, 0.55)';
            snakeContext.shadowBlur = 18;
            snakeContext.strokeStyle = 'rgba(141, 240, 198, 0.2)';
            snakeContext.lineWidth = 18;
            snakeContext.stroke();
            snakeContext.shadowBlur = 9;
            snakeContext.strokeStyle = 'rgba(242, 179, 61, 0.56)';
            snakeContext.lineWidth = 6;
            snakeContext.stroke();
            snakeContext.shadowBlur = 0;
            snakeContext.strokeStyle = 'rgba(255, 255, 255, 0.65)';
            snakeContext.lineWidth = 2;
            snakeContext.stroke();

            for (var s = snakeSegments.length - 1; s >= 0; s--) {
                var segment = snakeSegments[s];
                var alpha = 1 - (s / snakeSegments.length);
                var radius = s === 0 ? 13 : Math.max(4, 10 - s * 0.18);
                snakeContext.beginPath();
                snakeContext.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
                snakeContext.fillStyle = 'rgba(141, 240, 198, ' + (0.08 + alpha * 0.34) + ')';
                snakeContext.fill();
                snakeContext.strokeStyle = 'rgba(242, 179, 61, ' + (0.1 + alpha * 0.38) + ')';
                snakeContext.lineWidth = s === 0 ? 2.5 : 1.2;
                snakeContext.stroke();
            }

            snakeContext.globalCompositeOperation = 'source-over';
            snakeContext.beginPath();
            snakeContext.arc(head.x + 4, head.y - 4, 2.1, 0, Math.PI * 2);
            snakeContext.arc(head.x - 4, head.y - 4, 2.1, 0, Math.PI * 2);
            snakeContext.fillStyle = '#f2b33d';
            snakeContext.fill();

            snakeFrame = window.requestAnimationFrame(drawSnake);
        }

        function startSnake() {
            if (snakeRunning || !supportsSnake()) {
                return;
            }
            resizeSnake();
            snakeRunning = true;
            snakeFrame = window.requestAnimationFrame(drawSnake);
        }

        function stopSnake() {
            snakeRunning = false;
            if (snakeFrame) {
                window.cancelAnimationFrame(snakeFrame);
            }
            snakeContext.clearRect(0, 0, snakeWidth, snakeHeight);
        }

        function updateSnakeState() {
            if (supportsSnake()) {
                startSnake();
            } else {
                stopSnake();
            }
        }

        function watchSnakeQuery(query) {
            if (query.addEventListener) {
                query.addEventListener('change', updateSnakeState);
            } else if (query.addListener) {
                query.addListener(updateSnakeState);
            }
        }

        window.addEventListener('mousemove', setSnakeTarget);
        window.addEventListener('load', function(){
            if (snakeRunning) {
                resizeSnake();
            }
        });
        window.addEventListener('resize', function(){
            if (snakeRunning) {
                resizeSnake();
            }
            updateSnakeState();
        });
        watchSnakeQuery(desktopSnakeQuery);
        updateSnakeState();
    }

})(jQuery);
