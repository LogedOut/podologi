'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // === 1. ПЛАВНОЕ ПОЯВЛЕНИЕ БЛОКОВ ПРИ СКРОЛЛЕ (Intersection Observer) ===
    const blocks = document.querySelectorAll('.block');
    if (blocks.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '100px 0px 50px 0px'
        });

        blocks.forEach(block => observer.observe(block));
    }

    // === 2. АНИМИРОВАННЫЙ СЧЁТЧИК ЦИФР В ОТЗЫВАХ ===
    let countersAnimated = false;
    const statsSection = document.querySelector('.reviews-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateNumbers();
            }
        }, { threshold: 0.3 });
        statsObserver.observe(statsSection);
    }

    function animateNumbers() {
        if (reducedMotion) return; // Уважаем настройки пользователя
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const targetText = stat.textContent.trim();
            if (targetText.includes('5.0')) {
                let current = 0.0;
                const timer = setInterval(() => {
                    current += 0.2;
                    if (current >= 5.0) {
                        stat.textContent = '5.0';
                        clearInterval(timer);
                    } else {
                        stat.textContent = current.toFixed(1);
                    }
                }, 40);
            } else if (targetText.includes('100%')) {
                let current = 0;
                const timer = setInterval(() => {
                    current += 5;
                    if (current >= 100) {
                        stat.textContent = '100%';
                        clearInterval(timer);
                    } else {
                        stat.textContent = current + '%';
                    }
                }, 35);
            }
        });
    }

    // === 3. КНОПКА "НАВЕРХ" С ПЛАВНЫМ СКРОЛЛОМ ===
    let backToTopBtn = document.querySelector('.back-to-top');
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTopBtn.setAttribute('aria-label', 'Наверх страницы');
        document.body.appendChild(backToTopBtn);
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: reducedMotion ? 'auto' : 'smooth'
        });
    });

    // === 4. МАСКА ДЛЯ ПОЛЯ ТЕЛЕФОНА ===
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let input = e.target.value.replace(/\D/g, '');
            if (input.startsWith('7') || input.startsWith('8')) {
                input = input.substring(1);
            }
            let formatted = '+7';
            if (input.length > 0) {
                formatted += ' (' + input.substring(0, 3);
            }
            if (input.length >= 3) {
                formatted += ')';
            }
            if (input.length > 3) {
                formatted += ' ' + input.substring(3, 6);
            }
            if (input.length >= 7) {
                formatted += '-' + input.substring(6, 8);
            }
            if (input.length >= 9) {
                formatted += '-' + input.substring(8, 10);
            }
            e.target.value = formatted;
            clearFieldError('phone');
        });

        phoneInput.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && (e.target.value === '+7' || e.target.value === '+7 ')) {
                e.target.value = '';
            }
        });
    }

    // === 5. ПОИСК ПО УСЛУГАМ ===
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const searchTargets = document.querySelectorAll('.block-description, .services-list li');

    function performSearch() {
        const searchTerm = (searchInput.value || '').toLowerCase().trim();
        if (!searchTerm) return;

        searchTargets.forEach(block => {
            const text = block.textContent.toLowerCase();
            const parent = block.closest('.block');
            if (text.includes(searchTerm)) {
                if (parent) {
                    parent.style.display = 'block';
                    const regex = new RegExp(searchTerm, 'gi');
                    block.innerHTML = block.textContent.replace(regex, match => 
                        `<span style="background-color: #e8f5e9; color: #1b4d3e; font-weight: 700; padding: 0 4px; border-radius: 4px;">${match}</span>`
                    );
                }
            } else {
                if (parent && !parent.querySelector('.block-description, .services-list li').textContent.toLowerCase().includes(searchTerm)) {
                    parent.style.display = 'none';
                }
            }
        });
    }

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });

        searchInput.addEventListener('input', function() {
            if (this.value === '') {
                searchTargets.forEach(block => {
                    const parent = block.closest('.block');
                    if (parent) {
                        parent.style.display = 'block';
                        block.innerHTML = block.textContent;
                    }
                });
            }
        });
    }

    // === 6. МОДАЛЬНОЕ ОКНО ОБРАТНОГО ЗВОНКА (A11Y: TRAP-FOCUS & RESTORE-FOCUS) ===
    const modal = document.getElementById('callbackModal');
    const callbackButtons = document.querySelectorAll('.callback-button');
    const callbackForm = document.getElementById('callbackForm');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const successCloseBtn = document.getElementById('successCloseBtn');
    const modalSuccessState = document.getElementById('modalSuccessState');
    let modalTriggerElement = null;

    function getFocusableElements(container) {
        if (!container) return [];
        return Array.from(container.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetParent !== null || window.getComputedStyle(el).display !== 'none');
    }

    const openModal = (trigger = null) => {
        modalTriggerElement = trigger || document.activeElement;
        clearFormErrors();
        if (modalSuccessState) modalSuccessState.style.display = 'none';
        if (callbackForm) {
            callbackForm.style.display = 'flex';
            callbackForm.reset();
            if (privacyConsent) privacyConsent.checked = true;
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы под модалкой

        const nameInput = document.getElementById('name');
        if (nameInput) {
            setTimeout(() => nameInput.focus(), 100);
        }
    };

    const closeModal = (restoreFocus = true) => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        clearFormErrors();
        if (restoreFocus && modalTriggerElement && typeof modalTriggerElement.focus === 'function') {
            modalTriggerElement.focus();
        }
        modalTriggerElement = null;
    };

    callbackButtons.forEach(button => {
        button.addEventListener('click', (e) => openModal(e.currentTarget));
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => closeModal(true));
    if (successCloseBtn) successCloseBtn.addEventListener('click', () => closeModal(true));

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(true);
    });

    // Клавиатурная навигация: Escape и Trap-Focus (фокус не покидает окно)
    document.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeModal(true);
            return;
        }

        if (e.key === 'Tab') {
            const focusable = getFocusableElements(modal);
            if (!focusable.length) {
                e.preventDefault();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    // === 7. УМНАЯ ВАЛИДАЦИЯ И БЕЗОПАСНАЯ ОТПРАВКА ЧЕРЕЗ WORKER ===
    const nameInput = document.getElementById('name');
    const privacyConsent = document.getElementById('privacyConsent');
    const formStatus = document.getElementById('formStatus');

    function setFieldError(fieldId, errorMsg) {
        const errorEl = document.getElementById(fieldId + 'Error');
        const groupEl = document.getElementById(fieldId + 'Group');
        const inputEl = document.getElementById(fieldId);

        if (errorEl) {
            errorEl.textContent = errorMsg;
            if (errorMsg) {
                errorEl.classList.add('visible');
            } else {
                errorEl.classList.remove('visible');
            }
        }
        if (groupEl) {
            if (errorMsg) {
                groupEl.classList.add('has-error');
            } else {
                groupEl.classList.remove('has-error');
            }
        }
        if (inputEl) {
            inputEl.setAttribute('aria-invalid', errorMsg ? 'true' : 'false');
        }
    }

    function clearFieldError(fieldId) {
        setFieldError(fieldId, '');
    }

    function clearFormErrors() {
        clearFieldError('name');
        clearFieldError('phone');
        clearFieldError('consent');
        if (formStatus) {
            formStatus.textContent = '';
            formStatus.style.display = 'none';
            formStatus.className = 'form-status-alert';
        }
    }

    if (nameInput) {
        nameInput.addEventListener('input', () => clearFieldError('name'));
    }
    if (privacyConsent) {
        privacyConsent.addEventListener('change', () => clearFieldError('consent'));
    }

    let lastSendTime = 0;

    if (callbackForm) {
        callbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormErrors();

            const name = (nameInput ? nameInput.value : '').trim();
            const phone = (phoneInput ? phoneInput.value : '').trim();
            const isConsentChecked = privacyConsent ? privacyConsent.checked : false;

            let hasError = false;
            let firstInvalidEl = null;

            if (name.length < 2) {
                setFieldError('name', 'Пожалуйста, введите ваше имя (минимум 2 буквы)');
                hasError = true;
                if (!firstInvalidEl) firstInvalidEl = nameInput;
            }

            const phonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
            if (!phonePattern.test(phone)) {
                setFieldError('phone', 'Введите номер телефона полностью: +7 (XXX) XXX-XX-XX');
                hasError = true;
                if (!firstInvalidEl) firstInvalidEl = phoneInput;
            }

            if (!isConsentChecked) {
                setFieldError('consent', 'Для отправки заявки необходимо согласие на обработку персональных данных (152-ФЗ)');
                hasError = true;
                if (!firstInvalidEl) firstInvalidEl = privacyConsent;
            }

            if (hasError) {
                if (firstInvalidEl && typeof firstInvalidEl.focus === 'function') {
                    firstInvalidEl.focus();
                }
                return;
            }

            // Защита от частых повторных нажатий (rate-limit 15 сек)
            const now = Date.now();
            if (now - lastSendTime < 15000) {
                if (formStatus) {
                    formStatus.textContent = 'Вы уже отправили заявку. Пожалуйста, подождите несколько секунд перед повторной отправкой.';
                    formStatus.style.display = 'block';
                }
                return;
            }

            const workerUrl = callbackForm.dataset.workerUrl || 'https://kasp.podolog-presnya.workers.dev';
            const submitButton = document.getElementById('callbackSubmitBtn') || callbackForm.querySelector('.submit-button');
            const originalBtnHtml = submitButton.innerHTML;

            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');
            submitButton.innerHTML = '<span>Отправка...</span> <i class="fas fa-spinner fa-spin"></i>';

            // AbortController с таймаутом 15 секунд (сеть не зависнет намертво)
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 15000);

            try {
                const response = await fetch(workerUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, phone }),
                    signal: controller.signal
                });

                const result = await response.json().catch(() => ({}));

                if (response.ok && result.success) {
                    lastSendTime = Date.now();
                    callbackForm.reset();
                    // Показываем красивый экран успеха
                    if (modalSuccessState) {
                        callbackForm.style.display = 'none';
                        modalSuccessState.style.display = 'block';
                        if (successCloseBtn) {
                            setTimeout(() => successCloseBtn.focus(), 100);
                        }
                    } else {
                        closeModal(true);
                    }
                } else {
                    throw new Error(result.error || 'Server error');
                }
            } catch (error) {
                console.error('Ошибка отправки формы:', error);
                if (formStatus) {
                    if (error.name === 'AbortError') {
                        formStatus.textContent = 'Превышено время ожидания ответа (15 сек). Проверьте интернет или позвоните нам: +7 (977) 807-94-09';
                    } else {
                        formStatus.textContent = 'Не удалось отправить заявку. Пожалуйста, позвоните нам напрямую: +7 (977) 807-94-09';
                    }
                    formStatus.style.display = 'block';
                }
            } finally {
                window.clearTimeout(timeoutId);
                submitButton.disabled = false;
                submitButton.removeAttribute('aria-busy');
                submitButton.innerHTML = originalBtnHtml;
            }
        });
    }

    // === 8. ЛАЙТБОКС ДЛЯ ФОТОГРАФИЙ ДО/ПОСЛЕ ===
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
    let lastImageTrigger = null;

    function openLightbox(src, alt, trigger) {
        if (!imageModal || !modalImage) return;
        lastImageTrigger = trigger;
        modalImage.src = src;
        modalImage.alt = alt || 'Фото работы подолога';
        imageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (lightboxCloseBtn) {
            setTimeout(() => lightboxCloseBtn.focus(), 100);
        }
    }

    function closeLightbox() {
        if (!imageModal) return;
        imageModal.classList.remove('active');
        document.body.style.overflow = '';
        if (modalImage) modalImage.src = '';
        if (lastImageTrigger && typeof lastImageTrigger.focus === 'function') {
            lastImageTrigger.focus();
        }
        lastImageTrigger = null;
    }

    // Привязываем клики как к .portfolio-item, так и к .portfolio-image
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        const img = item.querySelector('img');
        const altText = img ? img.alt : 'Пример работы подолога';
        item.setAttribute('aria-label', 'Увеличить фото: ' + altText);

        item.addEventListener('click', function(e) {
            const currentImg = this.querySelector('img') || e.target;
            if (currentImg && currentImg.src) {
                openLightbox(currentImg.src, currentImg.alt, this);
            }
        });

        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const currentImg = this.querySelector('img');
                if (currentImg && currentImg.src) {
                    openLightbox(currentImg.src, currentImg.alt, this);
                }
            }
        });
    });

    if (lightboxCloseBtn) {
        lightboxCloseBtn.addEventListener('click', closeLightbox);
    }

    if (imageModal) {
        imageModal.addEventListener('click', function(e) {
            if (e.target === imageModal || e.target === imageModal.querySelector('.lightbox-content-wrap')) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && imageModal && imageModal.classList.contains('active')) {
            closeLightbox();
        }
    });

});
