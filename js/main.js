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
        var snakeLastFrame = 0;
        var snakeTarget = { x: 0, y: 0, active: false };
        var snakeSegments = [];
        var snakeCount = 18;

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
                    y: Math.max(90, snakeHeight * 0.22) + Math.sin(i * 0.8) * 16
                });
            }
            snakeTarget.x = snakeWidth * 0.5;
            snakeTarget.y = Math.max(90, snakeHeight * 0.22);
        }

        function resizeSnake() {
            snakeDpr = Math.min(window.devicePixelRatio || 1, 1.5);
            snakeWidth = Math.max(1, Math.round(window.innerWidth || document.documentElement.clientWidth || 1));
            snakeHeight = Math.max(1, Math.round(window.innerHeight || document.documentElement.clientHeight || 1));
            snakeCanvas.width = Math.round(snakeWidth * snakeDpr);
            snakeCanvas.height = Math.round(snakeHeight * snakeDpr);
            snakeCanvas.style.width = snakeWidth + 'px';
            snakeCanvas.style.height = snakeHeight + 'px';
            snakeContext.setTransform(snakeDpr, 0, 0, snakeDpr, 0, 0);
            resetSnakeSegments();
        }

        function setSnakeTarget(event) {
            var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
            var x = event.pageX - scrollLeft;
            var y = event.pageY - scrollTop;
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

            if (time - snakeLastFrame < 33) {
                snakeFrame = window.requestAnimationFrame(drawSnake);
                return;
            }
            snakeLastFrame = time;

            var idleY = clamp((snakeHeight * 0.5) + Math.sin(time * 0.0014) * snakeHeight * 0.24, 72, snakeHeight - 72);
            var idleX = clamp(snakeWidth * 0.5 + Math.cos(time * 0.0009) * snakeWidth * 0.26, 100, snakeWidth - 100);
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
            snakeContext.shadowColor = 'rgba(8, 35, 64, 0.38)';
            snakeContext.shadowBlur = 8;
            snakeContext.strokeStyle = 'rgba(8, 35, 64, 0.38)';
            snakeContext.lineWidth = 12;
            snakeContext.stroke();
            snakeContext.shadowBlur = 4;
            snakeContext.strokeStyle = 'rgba(86, 201, 255, 0.42)';
            snakeContext.lineWidth = 4;
            snakeContext.stroke();
            snakeContext.shadowBlur = 0;
            snakeContext.strokeStyle = 'rgba(255, 255, 255, 0.65)';
            snakeContext.lineWidth = 1.5;
            snakeContext.stroke();

            for (var s = snakeSegments.length - 1; s >= 0; s--) {
                var segment = snakeSegments[s];
                var alpha = 1 - (s / snakeSegments.length);
                var radius = s === 0 ? 11 : Math.max(3.5, 8 - s * 0.16);
                snakeContext.beginPath();
                snakeContext.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
                snakeContext.fillStyle = 'rgba(8, 35, 64, ' + (0.14 + alpha * 0.3) + ')';
                snakeContext.fill();
                snakeContext.strokeStyle = 'rgba(86, 201, 255, ' + (0.12 + alpha * 0.28) + ')';
                snakeContext.lineWidth = s === 0 ? 2 : 1;
                snakeContext.stroke();
            }

            snakeContext.globalCompositeOperation = 'source-over';
            snakeContext.beginPath();
            snakeContext.arc(head.x + 4, head.y - 4, 2.1, 0, Math.PI * 2);
            snakeContext.arc(head.x - 4, head.y - 4, 2.1, 0, Math.PI * 2);
            snakeContext.fillStyle = '#56c9ff';
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
