document.addEventListener('DOMContentLoaded', function() {
    // === 1. ПЛАВНОЕ ПОЯВЛЕНИЕ БЛОКОВ ПРИ СКРОЛЛЕ (Intersection Observer) ===
    const blocks = document.querySelectorAll('.block');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '150px 0px 50px 0px', threshold: 0.01
    });

    blocks.forEach(block => observer.observe(block));

    // === 2. АНИМИРОВАННЫЙ СЧЁТЧИК ЦИФР В ОТЗЫВАХ ===
    let countersAnimated = false;
    const statsSection = document.querySelector('.reviews-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateNumbers();
            }
        }, { threshold: 0.4 });
        statsObserver.observe(statsSection);
    }

    function animateNumbers() {
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
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTopBtn.setAttribute('aria-label', 'Наверх страницы');
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
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
            let formatted = '+7 ';
            if (input.length > 0) {
                formatted += '(' + input.substring(0, 3);
            }
            if (input.length >= 4) {
                formatted += ') ' + input.substring(3, 6);
            }
            if (input.length >= 7) {
                formatted += '-' + input.substring(6, 8);
            }
            if (input.length >= 9) {
                formatted += '-' + input.substring(8, 10);
            }
            e.target.value = formatted;
        });

        phoneInput.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && e.target.value === '+7 ') {
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

    // === 6. МОДАЛЬНОЕ ОКНО ОБРАТНОГО ЗВОНКА ===
    const modal = document.getElementById('callbackModal');
    const callbackButtons = document.querySelectorAll('.callback-button');
    const callbackForm = document.getElementById('callbackForm');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const successCloseBtn = document.getElementById('successCloseBtn');
    const modalSuccessState = document.getElementById('modalSuccessState');

    const openModal = () => {
        if (modalSuccessState) modalSuccessState.style.display = 'none';
        if (callbackForm) callbackForm.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы под модалкой
        const nameInput = document.getElementById('name');
        if (nameInput) setTimeout(() => nameInput.focus(), 150);
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    callbackButtons.forEach(button => {
        button.addEventListener('click', openModal);
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // === 7. БЕЗОПАСНАЯ ОТПРАВКА ЗАЯВКИ ЧЕРЕЗ CLOUDFLARE WORKER ===
    const WORKER_URL = 'https://kasp.podolog-presnya.workers.dev';
    let lastSendTime = 0;

    callbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const now = Date.now();
        if (now - lastSendTime < 20000) {
            alert('Пожалуйста, подождите немного перед отправкой повторной заявки.');
            return;
        }

        const nameInput = document.getElementById('name');
        const name = (nameInput.value || '').trim();
        const phone = (phoneInput ? phoneInput.value : '').trim();

        if (name.length < 2) {
            alert('Пожалуйста, введите ваше имя');
            if (nameInput) nameInput.focus();
            return;
        }

        if (phone.length < 18) {
            alert('Пожалуйста, введите полный номер телефона: +7 (XXX) XXX-XX-XX');
            if (phoneInput) phoneInput.focus();
            return;
        }

        const submitButton = document.getElementById('callbackSubmitBtn') || callbackForm.querySelector('.submit-button');
        const originalHtml = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>Отправка...</span> <i class="fas fa-spinner fa-spin"></i>';
        
        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, phone })
            });

            const result = await response.json().catch(() => ({}));

            if (response.ok && result.success) {
                lastSendTime = Date.now();
                callbackForm.reset();
                // Показываем красивый success state без alert()
                if (modalSuccessState) {
                    callbackForm.style.display = 'none';
                    modalSuccessState.style.display = 'block';
                } else {
                    alert('Спасибо! Ваша заявка успешно принята. Мы свяжемся с вами в ближайшее время.');
                    closeModal();
                }
            } else {
                throw new Error(result.error || 'Server error');
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            alert('Произошла ошибка при отправке заявки. Пожалуйста, позвоните нам напрямую: +7 (977) 807-94-09');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalHtml;
        }
    });
});






