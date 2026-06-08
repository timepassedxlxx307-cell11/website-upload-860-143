(function () {
    var body = document.body;
    var root = body.getAttribute('data-root') || './';
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle) {
        toggle.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
                slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
                dot.setAttribute('aria-current', i === current ? 'true' : 'false');
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 6200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));

    searchInputs.forEach(function (input) {
        var box = input.closest('[data-search-box]');
        var results = box ? box.querySelector('[data-search-results]') : null;

        if (!results) {
            return;
        }

        function closeResults() {
            results.classList.remove('is-open');
            results.innerHTML = '';
        }

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            var data = window.SITE_SEARCH_DATA || [];

            if (!keyword) {
                closeResults();
                return;
            }

            var matches = data.filter(function (item) {
                var haystack = [item.title, item.category, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase();
                return haystack.indexOf(keyword) !== -1;
            }).slice(0, 10);

            if (!matches.length) {
                results.innerHTML = '<div class="search-result-item"><span class="search-result-title">未找到相关影片</span><span class="search-result-meta">换一个关键词试试</span></div>';
                results.classList.add('is-open');
                return;
            }

            results.innerHTML = matches.map(function (item) {
                return '<a class="search-result-item" href="' + root + item.url + '">' +
                    '<span class="search-result-title">' + item.title + '</span>' +
                    '<span class="search-result-meta">' + item.year + ' · ' + item.type + ' · ' + item.category + '</span>' +
                    '</a>';
            }).join('');
            results.classList.add('is-open');
        });

        document.addEventListener('click', function (event) {
            if (!box.contains(event.target)) {
                closeResults();
            }
        });
    });

    var pageFilter = document.querySelector('[data-page-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function updateCards() {
        if (!cards.length) {
            return;
        }

        var keyword = pageFilter ? pageFilter.value.trim().toLowerCase() : '';
        var type = typeFilter ? typeFilter.value : '';

        cards.forEach(function (card) {
            var text = card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-year');
            var matchedText = !keyword || text.toLowerCase().indexOf(keyword) !== -1;
            var matchedType = !type || card.getAttribute('data-type') === type;
            card.style.display = matchedText && matchedType ? '' : 'none';
        });
    }

    if (pageFilter) {
        pageFilter.addEventListener('input', updateCards);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', updateCards);
    }
})();
