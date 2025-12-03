/* ========================================================================
   БОЛЬ И ПАМЯТЬ СКВОЗЬ ГОДА — JavaScript
   Функциональность: мобильное меню, фильтры, модальные окна, лайтбокс
   ======================================================================== */

// ========== ИНИЦИАЛИЗАЦИЯ ==========

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initMemories();
    initGallery();
    initContactForm();
    initFAQ();
});

// ========== МОБИЛЬНОЕ МЕНЮ ==========

function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Закрытие меню при клике на пункт
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);

            if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// ========== ВОСПОМИНАНИЯ ==========

let memoriesData = [];

function initMemories() {
    const memoriesContainer = document.getElementById('memoriesContainer');
    const yearFilter = document.getElementById('yearFilter');
    const regionFilter = document.getElementById('regionFilter');
    const tagFilter = document.getElementById('tagFilter');
    const resetFilters = document.getElementById('resetFilters');
    const modal = document.getElementById('memoryModal');
    const modalClose = document.getElementById('modalClose');

    if (!memoriesContainer) return;

    // Загрузка данных воспоминаний
    fetch('data/memories.json')
        .then(response => response.json())
        .then(data => {
            memoriesData = data;
            renderMemories(memoriesData);
        })
        .catch(error => console.error('Ошибка загрузки воспоминаний:', error));

    // Фильтры
    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }
    if (regionFilter) {
        regionFilter.addEventListener('change', applyFilters);
    }
    if (tagFilter) {
        tagFilter.addEventListener('change', applyFilters);
    }
    if (resetFilters) {
        resetFilters.addEventListener('click', function() {
            yearFilter.value = '';
            regionFilter.value = '';
            tagFilter.value = '';
            renderMemories(memoriesData);
        });
    }

    // Модальное окно
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }

    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Закрытие модального окна при нажатии Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

function renderMemories(memories) {
    const container = document.getElementById('memoriesContainer');
    const noResults = document.getElementById('noResults');

    if (!container) return;

    container.innerHTML = '';

    if (memories.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    memories.forEach(memory => {
        const card = document.createElement('article');
        card.className = 'story-card';
        card.setAttribute('data-memory-id', memory.id);
        card.innerHTML = `
            <img src="${memory.image}" alt="Фото ${memory.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 1rem;">
            <h3>${memory.name}</h3>
            <p class="story-date">${formatDate(memory.date)}</p>
            <p><strong>${memory.year} год</strong></p>
            <p>${memory.shortText}</p>
            <button class="btn btn-small" aria-label="Читать полностью">Читать полностью</button>
        `;

        card.querySelector('button').addEventListener('click', function() {
            openMemoryModal(memory);
        });

        container.appendChild(card);
    });
}

function applyFilters() {
    const yearFilter = document.getElementById('yearFilter');
    const regionFilter = document.getElementById('regionFilter');
    const tagFilter = document.getElementById('tagFilter');

    const year = yearFilter ? yearFilter.value : '';
    const region = regionFilter ? regionFilter.value : '';
    const tag = tagFilter ? tagFilter.value : '';

    const filtered = memoriesData.filter(memory => {
        const yearMatch = !year || memory.year.toString() === year;
        const regionMatch = !region || memory.region === region;
        const tagMatch = !tag || memory.tags.includes(tag);

        return yearMatch && regionMatch && tagMatch;
    });

    renderMemories(filtered);
}

function openMemoryModal(memory) {
    const modal = document.getElementById('memoryModal');
    const modalBody = document.getElementById('modalBody');

    const tagsHtml = memory.tags.map(tag => `<span style="display: inline-block; background: #c41e3a; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; margin-right: 0.5rem; font-size: 0.85rem;">${formatTag(tag)}</span>`).join('');

    modalBody.innerHTML = `
        <img src="${memory.image}" alt="Фото ${memory.name}" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 1rem;">
        <h2>${memory.name}</h2>
        <p><strong>Возраст в 1945 году:</strong> ${memory.ageIn1945}</p>
        <p><strong>Регион:</strong> ${formatRegion(memory.region)}</p>
        <p><strong>Документировано:</strong> ${formatDate(memory.date)}</p>
        <div style="margin-bottom: 1rem;">${tagsHtml}</div>
        <div style="white-space: pre-wrap; line-height: 1.8;">
            ${memory.fullText}
        </div>
    `;

    modal.classList.add('active');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', options);
}

function formatTag(tag) {
    const tagMap = {
        'фронт': 'Фронт',
        'тыл': 'Тыл',
        'блокада': 'Блокада',
        'оккупация': 'Оккупация',
        'эвакуация': 'Эвакуация',
        'медицина': 'Медицина',
        'армия': 'Армия'
    };
    return tagMap[tag] || tag;
}

function formatRegion(region) {
    const regionMap = {
        'ленинград': 'Ленинград (блокада)',
        'москва': 'Московская область',
        'волга': 'Поволжье',
        'кавказ': 'Кавказ',
        'украина': 'Украина',
        'беларусь': 'Беларусь'
    };
    return regionMap[region] || region;
}

// ========== ГАЛЕРЕЯ ==========

function initGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    // Пример данных галереи (можно заменить на загрузку из JSON)
    const galleryItems = [
        {
            id: 1,
            src: 'assets/images/gallery-1.jpg',
            caption: 'Советские войска в наступлении, 1943 год',
            source: 'Архив РГАСПИ'
        },
        {
            id: 2,
            src: 'assets/images/gallery-2.jpg',
            caption: 'Разрушенные здания Сталинграда, 1942 год',
            source: 'Музей-панорама "Сталинградская битва"'
        },
        {
            id: 3,
            src: 'assets/images/gallery-3.jpg',
            caption: 'Портреты партизан из архива сопротивления',
            source: 'РГАКФД'
        },
        {
            id: 4,
            src: 'assets/images/gallery-4.jpg',
            caption: 'Госпиталь Красного Креста, полевая медицина',
            source: 'Музей Победы'
        },
        {
            id: 5,
            src: 'assets/images/gallery-5.jpg',
            caption: 'Минская операция, июль 1944 года',
            source: 'Архив ВИМАИВиВС'
        },
        {
            id: 6,
            src: 'assets/images/gallery-6.jpg',
            caption: 'Берлинская операция, май 1945 года',
            source: 'РГАКФД'
        }
    ];

    // Рендеринг элементов галереи
    galleryItems.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${item.src}" alt="${item.caption}" loading="lazy">
            <div class="gallery-item-caption">
                <p style="margin: 0;">${item.caption}</p>
            </div>
        `;

        galleryItem.addEventListener('click', function() {
            openLightbox(galleryItems, index);
        });

        galleryGrid.appendChild(galleryItem);
    });

    // Инициализация лайтбокса
    initLightbox();
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    if (!lightbox) return;

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function() {
            navigateLightbox(-1);
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', function() {
            navigateLightbox(1);
        });
    }

    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // Закрытие при нажатии Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Навигация стрелками
    document.addEventListener('keydown', function(event) {
        if (lightbox.classList.contains('active')) {
            if (event.key === 'ArrowLeft') {
                navigateLightbox(-1);
            } else if (event.key === 'ArrowRight') {
                navigateLightbox(1);
            }
        }
    });
}

let currentLightboxIndex = 0;
let currentLightboxItems = [];

function openLightbox(items, index) {
    const lightbox = document.getElementById('lightbox');
    currentLightboxItems = items;
    currentLightboxIndex = index;

    updateLightboxContent();
    lightbox.classList.add('active');
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
}

function navigateLightbox(direction) {
    currentLightboxIndex += direction;

    if (currentLightboxIndex < 0) {
        currentLightboxIndex = currentLightboxItems.length - 1;
    } else if (currentLightboxIndex >= currentLightboxItems.length) {
        currentLightboxIndex = 0;
    }

    updateLightboxContent();
}

function updateLightboxContent() {
    const item = currentLightboxItems[currentLightboxIndex];
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxSource = document.getElementById('lightboxSource');

    if (lightboxImage) {
        lightboxImage.src = item.src;
        lightboxImage.alt = item.caption;
    }

    if (lightboxCaption) {
        lightboxCaption.textContent = item.caption;
    }

    if (lightboxSource) {
        lightboxSource.textContent = 'Источник: ' + item.source;
    }
}

// ========== ФОРМА КОНТАКТОВ ==========

function initContactForm() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Получение данных формы
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const category = document.getElementById('category').value;
        const message = document.getElementById('message').value;
        const consent = document.getElementById('consent').checked;

        // Валидация
        if (!name || !email || !category || !message || !consent) {
            showFormMessage('Пожалуйста, заполните все поля и согласитесь с обработкой данных', 'error');
            return;
        }

        // Валидация email
        if (!validateEmail(email)) {
            showFormMessage('Пожалуйста, введите корректный email', 'error');
            return;
        }

        // Имитация отправки (в реальности нужен серверный обработчик)
        submitFormData({
            name: name,
            email: email,
            category: category,
            message: message,
            timestamp: new Date().toISOString()
        });
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function submitFormData(data) {
    // В реальности это должно отправляться на сервер
    // Например: POST запрос на /api/contact
    console.log('Форма отправлена:', data);

    // Имитация успешной отправки
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    showFormMessage('Спасибо! Ваше сообщение было отправлено. Мы ответим вам в течение 48 часов.', 'success');

    // Очистка формы
    form.reset();

    // Скрытие сообщения через 5 секунд
    setTimeout(function() {
        formMessage.style.display = 'none';
    }, 5000);
}

function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');

    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.style.display = 'block';

    if (type === 'error') {
        formMessage.style.backgroundColor = '#f2dede';
        formMessage.style.borderColor = '#ebccd1';
        formMessage.style.color = '#a94442';
    } else if (type === 'success') {
        formMessage.style.backgroundColor = '#dff0d8';
        formMessage.style.borderColor = '#d6e9c6';
        formMessage.style.color = '#3c763d';
    }
}

// ========== FAQ ==========

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const summary = item.querySelector('summary');
        if (summary) {
            summary.addEventListener('click', function() {
                // Закрытие других открытых элементов (опционально)
                // faqItems.forEach(otherItem => {
                //     if (otherItem !== item) {
                //         otherItem.removeAttribute('open');
                //     }
                // });
            });
        }
    });
}

// ========== УТИЛИТЫ ==========

// Функция для плавного скроллинга (используется браузером)
// можно убрать, так как используется scroll-behavior: smooth в CSS

// ========== ДОСТУПНОСТЬ ==========

// Управление фокусом при открытии модального окна
function manageFocusOnModal(modal, isOpen) {
    if (isOpen) {
        modal.setAttribute('aria-hidden', 'false');
    } else {
        modal.setAttribute('aria-hidden', 'true');
    }
}