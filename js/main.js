// Основная логика сайта: тема, навигация, локальное хранилище

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    updateNavigation();
    checkAuthentication();
    debugAuthState(); // Для отладки
});

// Работа с темами
function initializeTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    const themeLabel = document.getElementById('theme-label');
    
    // Установка текущей темы из localStorage
    const currentTheme = localStorage.getItem('moskva_live_theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeSwitch) {
        themeSwitch.checked = currentTheme === 'dark';
        updateThemeLabel(themeLabel, currentTheme);
        
        // Обработчик переключения темы
        themeSwitch.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('moskva_live_theme', newTheme);
            updateThemeLabel(themeLabel, newTheme);
        });
    }
}

function updateThemeLabel(labelElement, theme) {
    if (labelElement) {
        labelElement.textContent = theme === 'dark' ? 'Тёмная тема' : 'Светлая тема';
    }
}

// Навигация и аутентификация
function updateNavigation() {
    const currentUser = getCurrentUser();
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    
    console.log('Обновление навигации, текущий пользователь:', currentUser);
    
    if (currentUser) {
        if (loginLink) {
            loginLink.textContent = 'Выйти';
            loginLink.href = '#';
            // Устанавливаем обработчик для выхода
            loginLink.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        }
        if (registerLink) {
            registerLink.style.display = 'none';
        }
    } else {
        if (loginLink) {
            loginLink.textContent = 'Вход';
            loginLink.href = 'login.html';
            loginLink.onclick = null;
        }
        if (registerLink) {
            registerLink.style.display = 'block';
        }
    }
}

function checkAuthentication() {
    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    console.log('Проверка аутентификации:', { 
        currentUser, 
        currentPage,
        hasUser: !!currentUser 
    });
    
    // Если пользователь не авторизован и пытается получить доступ к защищенным страницам
    const protectedPages = ['profile.html'];
    if (protectedPages.includes(currentPage) && !currentUser) {
        console.log('Перенаправление на login.html - пользователь не авторизован');
        window.location.href = 'login.html';
        return;
    }
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        console.log('Выход из системы');
        localStorage.removeItem('moskva_live_current_user');
        window.location.href = 'index.html';
    }
}

// Утилиты для работы с localStorage (все здесь, чтобы избежать дубликатов)
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('moskva_live_current_user');
        if (!userData) {
            console.log('Текущий пользователь не найден в localStorage');
            return null;
        }
        
        const user = JSON.parse(userData);
        console.log('Текущий пользователь из localStorage:', user);
        return user;
    } catch (error) {
        console.error('Ошибка при чтении текущего пользователя:', error);
        return null;
    }
}

function saveCurrentUser(user) {
    try {
        localStorage.setItem('moskva_live_current_user', JSON.stringify(user));
        console.log('Текущий пользователь сохранен:', user);
    } catch (error) {
        console.error('Ошибка при сохранении текущего пользователя:', error);
    }
}

function getUsers() {
    try {
        const users = localStorage.getItem('moskva_live_users');
        const usersArray = users ? JSON.parse(users) : [];
        console.log('Пользователи из localStorage:', usersArray);
        return usersArray;
    } catch (error) {
        console.error('Ошибка при чтении пользователей:', error);
        return [];
    }
}

function saveUsers(users) {
    try {
        localStorage.setItem('moskva_live_users', JSON.stringify(users));
        console.log('Пользователи сохранены в localStorage');
    } catch (error) {
        console.error('Ошибка при сохранении пользователей:', error);
    }
}

function getPosts() {
    try {
        const posts = localStorage.getItem('moskva_live_posts');
        return posts ? JSON.parse(posts) : [];
    } catch (error) {
        console.error('Ошибка при чтении постов:', error);
        return [];
    }
}

function savePosts(posts) {
    try {
        localStorage.setItem('moskva_live_posts', JSON.stringify(posts));
    } catch (error) {
        console.error('Ошибка при сохранении постов:', error);
    }
}

function getPendingPosts() {
    try {
        const pendingPosts = localStorage.getItem('moskva_live_pending_posts');
        return pendingPosts ? JSON.parse(pendingPosts) : [];
    } catch (error) {
        console.error('Ошибка при чтении постов на модерации:', error);
        return [];
    }
}

function savePendingPosts(pendingPosts) {
    try {
        localStorage.setItem('moskva_live_pending_posts', JSON.stringify(pendingPosts));
    } catch (error) {
        console.error('Ошибка при сохранении постов на модерации:', error);
    }
}

function getPriceList() {
    try {
        const priceList = localStorage.getItem('moskva_live_price_list');
        if (priceList) {
            return JSON.parse(priceList);
        } else {
            // Инициализация прайс-листа по умолчанию
            const defaultPriceList = [
                { id: 2, service: "Рекламная статья", description: "Размещение рекламной статьи с выделенным оформлением", price: 1.000.000 },
                { id: 3, service: "Интервью", description: "Проведение и публикация интервью с участником", price: 300.000 },
                { id: 6, service: "Журнал", description: "Создание эксклюзивного журнала", price: 3.000.000 }
            ];
            savePriceList(defaultPriceList);
            return defaultPriceList;
        }
    } catch (error) {
        console.error('Ошибка при чтении прайс-листа:', error);
        return [];
    }
}

function savePriceList(priceList) {
    try {
        localStorage.setItem('moskva_live_price_list', JSON.stringify(priceList));
    } catch (error) {
        console.error('Ошибка при сохранении прайс-листа:', error);
    }
}

// Утилиты для форматирования даты
function formatDate(dateString) {
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    } catch (error) {
        console.error('Ошибка при форматировании даты:', error);
        return dateString;
    }
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Функция для отладки состояния аутентификации
function debugAuthState() {
    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    console.log('=== ДЕБАГ СОСТОЯНИЯ АУТЕНТИФИКАЦИИ ===');
    console.log('Текущая страница:', currentPage);
    console.log('Текущий пользователь:', currentUser);
    console.log('Все данные в localStorage:');
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`  ${key}:`, localStorage.getItem(key));
    }
    console.log('=====================================');
}/* JS main.js из примера */
