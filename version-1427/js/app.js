(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initImages() {
        Array.prototype.forEach.call(document.querySelectorAll('img'), function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-hidden');
                var holder = image.closest('.poster-frame, .hero-poster, .rank-thumb, .detail-cover, .category-thumbs');
                if (holder) {
                    holder.classList.add('image-quiet');
                }
            }, { once: true });
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 6200);
    }

    function getParams() {
        return new URLSearchParams(window.location.search || '');
    }

    function initFilters() {
        var grid = document.querySelector('[data-filterable="true"]');
        var panel = document.querySelector('[data-filter-panel]');
        if (!grid || !panel) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var search = panel.querySelector('[data-filter-search]');
        var category = panel.querySelector('[data-filter-category]');
        var type = panel.querySelector('[data-filter-type]');
        var region = panel.querySelector('[data-filter-region]');
        var sort = panel.querySelector('[data-filter-sort]');
        var empty = document.querySelector('[data-empty-state]');
        var params = getParams();
        if (search && params.get('q')) {
            search.value = params.get('q');
        }
        if (category && params.get('category')) {
            category.value = params.get('category');
        }
        if (type && params.get('type')) {
            type.value = params.get('type');
        }
        if (region && params.get('region')) {
            region.value = params.get('region');
        }
        if (sort && params.get('sort')) {
            sort.value = params.get('sort');
        }
        function textOf(card) {
            return [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(' ').toLowerCase();
        }
        function applySort(list) {
            var mode = sort ? sort.value : 'default';
            var sorted = list.slice();
            if (mode === 'views') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                });
            }
            if (mode === 'year') {
                sorted.sort(function (a, b) {
                    return String(b.dataset.year || '').localeCompare(String(a.dataset.year || ''), 'zh-CN');
                });
            }
            if (mode === 'title') {
                sorted.sort(function (a, b) {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }
        function applyFilter() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var selectedCategory = category ? category.value : '';
            var selectedType = type ? type.value : '';
            var selectedRegion = region ? region.value : '';
            var visible = [];
            cards.forEach(function (card) {
                var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
                var matchesCategory = !selectedCategory || card.dataset.category === selectedCategory;
                var matchesType = !selectedType || card.dataset.type === selectedType;
                var matchesRegion = !selectedRegion || card.dataset.region === selectedRegion;
                var show = matchesQuery && matchesCategory && matchesType && matchesRegion;
                card.hidden = !show;
                if (show) {
                    visible.push(card);
                }
            });
            applySort(visible);
            if (empty) {
                empty.hidden = visible.length !== 0;
            }
        }
        [search, category, type, region, sort].forEach(function (element) {
            if (!element) {
                return;
            }
            element.addEventListener('input', applyFilter);
            element.addEventListener('change', applyFilter);
        });
        applyFilter();
    }

    function loadStream(video, source) {
        if (!video || !source || video.dataset.ready === source) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            if (video.hlsInstance) {
                video.hlsInstance.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
        } else {
            video.src = source;
        }
        video.dataset.ready = source;
    }

    function initPlayers() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), function (player) {
            var video = player.querySelector('video[data-video]');
            var cover = player.querySelector('.player-cover');
            if (!video || !cover) {
                return;
            }
            function play() {
                loadStream(video, video.getAttribute('data-video'));
                player.classList.add('is-playing');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }
            cover.addEventListener('click', play);
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        });
    }

    ready(function () {
        initMenu();
        initImages();
        initHero();
        initFilters();
        initPlayers();
    });
}());
