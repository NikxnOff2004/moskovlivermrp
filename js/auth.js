// Логика регистрации, входа, ролей
// Утилиты (getUsers, saveUsers и т.д.) теперь в main.js

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    initializeDefaultData();
});

// Инициализация начальных данных
function initializeDefaultData() {
    // Проверяем, есть ли уже пользователи
    const users = getUsers();
    if (users.length === 0) {
        // Создаем тестового сотрудника для демонстрации
        const defaultEmployee = {
            id: 1,
            name: "Администратор",
            email: "admin@moskva-live.ru",
            username: "admin",
            password: "admin123",
            role: "employee",
            avatar: null,
            registeredAt: new Date().toISOString()
        };
        users.push(defaultEmployee);
        saveUsers(users);
        console.log('Создан тестовый пользователь:', defaultEmployee);
    }

    // Инициализация прайс-листа по умолчанию
    const priceList = getPriceList();
    if (priceList.length === 0) {
        const defaultPriceList = [
            { id: 1, service: "Размещение поста", description: "Публикация новостного поста на главной странице", price: 50 },
            { id: 2, service: "Рекламная статья", description: "Размещение рекламной статьи с выделенным оформлением", price: 100 },
            { id: 3, service: "Интервью", description: "Проведение и публикация интервью с участником", price: 150 },
            { id: 4, service: "Баннер на сайте", description: "Размещение рекламного баннера на сайте на 7 дней", price: 200 },
            { id: 5, service: "Спецрепортаж", description: "Подготовка и публикация специального репортажа", price: 120 },
            { id: 6, service: "Фотоотчет", description: "Публикация фотоотчета с события", price: 80 }
        ];
        savePriceList(defaultPriceList);
    }

    // Инициализация демо-постов
    const posts = getPosts();
    if (posts.length === 0) {
        const demoPosts = [
            {
                id: 1,
                title: "Добро пожаловать в Москва-Live!",
                content: "Мы рады приветствовать вас в нашем сообществе. Здесь вы найдете самые свежие новости и события виртуальной Москвы.",
                category: "news",
                media: null,
                author: "Администратор",
                authorId: 1,
                date: new Date().toISOString(),
                status: "published"
            },
            {
                id: 2,
                title: "Новый сезон RP событий",
                content: "Стартует новый сезон ролевых событий. Присоединяйтесь к нашему сообществу и участвуйте в захватывающих мероприятиях!",
                category: "announcement",
                media: null,
                author: "Администратор",
                authorId: 1,
                date: new Date(Date.now() - 86400000).toISOString(),
                status: "published"
            }
        ];
        savePosts(demoPosts);
    }
}

function initializeAuthForms() {
    // Форма входа
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    
    console.log('Попытка входа:', { username, password });
    
    // Валидация
    if (!username || !password) {
        showError(errorElement, 'Все поля обязательны для заполнения');
        return;
    }
    
    // Проверка пользователя
    const users = getUsers();
    const user = users.find(u => 
        (u.email === username || u.username === username) && u.password === password
    );
    
    if (user) {
        console.log('Пользователь найден:', user);
        
        // Сохраняем текущего пользователя (без пароля)
        const userToSave = {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            avatar: user.avatar,
            registeredAt: user.registeredAt
        };
        
        saveCurrentUser(userToSave);
        
        // Проверяем сохранение
        const savedUser = getCurrentUser();
        console.log('Проверка сохраненного пользователя:', savedUser);
        
        // Показываем успешное сообщение
        showSuccess('Вход выполнен успешно!');
        
        // Перенаправляем на профиль
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
    } else {
        console.log('Пользователь не найден или неверный пароль');
        showError(errorElement, 'Неверный email/логин или пароль');
    }
}

function handleRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const role = document.getElementById('register-role').value;
    const errorElement = document.getElementById('register-error');
    
    console.log('Начало регистрации:', { name, email, password, confirmPassword, role });
    
    // Валидация
    if (!name || !email || !password || !confirmPassword) {
        showError(errorElement, 'Все поля обязательны для заполнения');
        return;
    }
    
    if (password !== confirmPassword) {
        showError(errorElement, 'Пароли не совпадают');
        return;
    }
    
    if (password.length < 6) {
        showError(errorElement, 'Пароль должен содержать не менее 6 символов');
        return;
    }
    
    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError(errorElement, 'Введите корректный email адрес');
        return;
    }
    
    // Проверка существующего пользователя (теперь и по username)
    const users = getUsers();
    const existingUser = users.find(u => u.email === email || u.username === email.split('@')[0]);
    
    if (existingUser) {
        showError(errorElement, 'Пользователь с таким email или username уже существует');
        return;
    }
    
    // Создание нового пользователя
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        username: email.split('@')[0],
        password: password,
        role: role,
        avatar: null,
        registeredAt: new Date().toISOString()
    };
    
    console.log('Новый пользователь:', newUser);
    
    users.push(newUser);
    saveUsers(users);
    
    // Автоматический вход после регистрации (без пароля)
    const userToSave = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        avatar: newUser.avatar,
        registeredAt: newUser.registeredAt
    };
    
    saveCurrentUser(userToSave);
    
    // Проверяем сохранение
    const savedUser = getCurrentUser();
    console.log('Проверка сохраненного пользователя:', savedUser);
    
    // Показываем успешное сообщение
    showSuccess('Регистрация прошла успешно!');
    
    // Перенаправление на профиль
    setTimeout(() => {
        window.location.href = 'profile.html';
    }, 1500);
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    successElement.style.cssText = `
        background-color: #d4edda;
        color: #155724;
        padding: 12px;
        border-radius: 4px;
        margin: 15px 0;
        border: 1px solid #c3e6cb;
    `;
    
    const form = document.querySelector('form');
    if (form) {
        form.parentNode.insertBefore(successElement, form);
    }
}
