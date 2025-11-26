// Логика работы с постами и модерацией
// Утилиты (getPosts, getCurrentUser и т.д.) теперь в main.js

document.addEventListener('DOMContentLoaded', function() {
    initializePosts();
    initializePriceList();
    initializeProfile();
});

// Работа с постами
function initializePosts() {
    const currentUser = getCurrentUser();
    
    // Загрузка постов на главной странице
    if (document.getElementById('posts-container')) {
        loadPosts();
        
        // Показываем кнопку добавления поста для сотрудников
        const addPostBtn = document.getElementById('add-post-btn');
        if (addPostBtn && currentUser && currentUser.role === 'employee') {
            addPostBtn.style.display = 'block';
            addPostBtn.addEventListener('click', showPostModal);
        }
        
        // Инициализация модального окна для постов
        initializePostModal();
    }
}

function loadPosts() {
    const postsContainer = document.getElementById('posts-container');
    const posts = getPosts();
    const currentUser = getCurrentUser();
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>Пока нет опубликованных постов.</p>';
        return;
    }
    
    // Сортируем посты по дате (новые сначала)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let postsHTML = '';
    posts.forEach(post => {
        postsHTML += `
            <div class="post-card">
                <h4>${post.title}</h4>
                <p class="post-meta">Автор: ${post.author} | ${formatDate(post.date)} | Категория: ${getCategoryName(post.category)}</p>
                <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                ${post.media ? `<p><a href="${post.media}" target="_blank">Медиа-материал</a></p>` : ''}
                ${currentUserCanEdit() ? `
                    <div class="post-actions">
                        <button class="btn-secondary edit-post" data-id="${post.id}">Редактировать</button>
                        <button class="btn-secondary delete-post" data-id="${post.id}">Удалить</button>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    postsContainer.innerHTML = postsHTML;
    
    // Добавляем обработчики для кнопок редактирования и удаления
    if (currentUserCanEdit()) {
        document.querySelectorAll('.edit-post').forEach(button => {
            button.addEventListener('click', function() {
                const postId = parseInt(this.getAttribute('data-id'));
                editPost(postId);
            });
        });
        
        document.querySelectorAll('.delete-post').forEach(button => {
            button.addEventListener('click', function() {
                const postId = parseInt(this.getAttribute('data-id'));
                deletePost(postId);
            });
        });
    }
}

function getCategoryName(category) {
    const categories = {
        'news': 'Новости',
        'interview': 'Интервью',
        'report': 'Репортаж',
        'announcement': 'Анонс'
    };
    
    return categories[category] || category;
}

function initializePostModal() {
    const modal = document.getElementById('post-modal');
    const closeBtn = document.querySelector('#post-modal .close');
    const cancelBtn = document.getElementById('cancel-post');
    const form = document.getElementById('post-form');
    
    if (modal && closeBtn) {
        // Закрытие модального окна
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Закрытие при клике вне модального окна
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Обработка отправки формы
        form.addEventListener('submit', handlePostSubmit);
    }
}

function showPostModal() {
    const modal = document.getElementById('post-modal');
    const form = document.getElementById('post-form');
    
    // Сброс формы
    form.reset();
    form.setAttribute('data-mode', 'create');
    form.removeAttribute('data-post-id');
    
    modal.style.display = 'block';
}

function handlePostSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('post-form');
    const mode = form.getAttribute('data-mode');
    const postId = form.getAttribute('data-post-id');
    const currentUser = getCurrentUser();
    
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const category = document.getElementById('post-category').value;
    const media = document.getElementById('post-media').value;
    
    if (mode === 'create') {
        // Создание нового поста
        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            category: category,
            media: media || null,
            author: currentUser.name,
            authorId: currentUser.id,
            date: new Date().toISOString(),
            status: 'published'
        };
        
        const posts = getPosts();
        posts.push(newPost);
        savePosts(posts);
        
        // Обновляем отображение постов
        loadPosts();
    } else if (mode === 'edit') {
        // Редактирование существующего поста
        const posts = getPosts();
        const postIndex = posts.findIndex(p => p.id === parseInt(postId));
        
        if (postIndex !== -1) {
            posts[postIndex].title = title;
            posts[postIndex].content = content;
            posts[postIndex].category = category;
            posts[postIndex].media = media || null;
            
            savePosts(posts);
            loadPosts();
        }
    }
    
    // Закрываем модальное окно
    document.getElementById('post-modal').style.display = 'none';
}

function editPost(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) return;
    
    const modal = document.getElementById('post-modal');
    const form = document.getElementById('post-form');
    
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-content').value = post.content;
    document.getElementById('post-category').value = post.category;
    document.getElementById('post-media').value = post.media || '';
    
    form.setAttribute('data-mode', 'edit');
    form.setAttribute('data-post-id', postId);
    
    modal.style.display = 'block';
}

function deletePost(postId) {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;
    
    const posts = getPosts();
    const updatedPosts = posts.filter(p => p.id !== postId);
    
    savePosts(updatedPosts);
    loadPosts();
}

// Работа с прайс-листом
function initializePriceList() {
    if (document.getElementById('price-table-body')) {
        loadPriceList();
        
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.role === 'employee') {
            document.getElementById('price-controls').style.display = 'block';
            document.getElementById('edit-prices').addEventListener('click', showPriceModal);
            document.getElementById('actions-header').style.display = 'table-cell';
        }
        
        initializePriceModal();
    }
}

function loadPriceList() {
    const tableBody = document.getElementById('price-table-body');
    const priceList = getPriceList();
    const currentUser = getCurrentUser();
    
    let html = '';
    priceList.forEach(item => {
        html += `
            <tr>
                <td>${item.service}</td>
                <td>${item.description}</td>
                <td>$${item.price}</td>
                ${currentUser && currentUser.role === 'employee' ? `
                    <td>
                        <button class="btn-secondary edit-price" data-id="${item.id}">Редактировать</button>
                        <button class="btn-secondary delete-price" data-id="${item.id}">Удалить</button>
                    </td>
                ` : ''}
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    if (currentUser && currentUser.role === 'employee') {
        document.querySelectorAll('.edit-price').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editPriceItem(id);
            });
        });
        
        document.querySelectorAll('.delete-price').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deletePriceItem(id);
            });
        });
    }
}

function initializePriceModal() {
    const modal = document.getElementById('price-modal');
    const closeBtn = document.querySelector('#price-modal .close');
    const cancelBtn = document.getElementById('cancel-price');
    const form = document.getElementById('price-form');
    
    if (modal && closeBtn) {
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        cancelBtn.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
        form.addEventListener('submit', handlePriceSubmit);
    }
}

function showPriceModal() {
    const modal = document.getElementById('price-modal');
    const form = document.getElementById('price-form');
    
    form.reset();
    form.setAttribute('data-mode', 'create');
    form.removeAttribute('data-id');
    document.getElementById('price-submit').textContent = 'Добавить';
    
    modal.style.display = 'block';
}

function handlePriceSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('price-form');
    const mode = form.getAttribute('data-mode');
    const id = form.getAttribute('data-id');
    
    const service = document.getElementById('price-service').value;
    const description = document.getElementById('price-description').value;
    const price = parseFloat(document.getElementById('price-amount').value);
    
    const priceList = getPriceList();
    
    if (mode === 'create') {
        const newItem = {
            id: Date.now(),
            service,
            description,
            price
        };
        priceList.push(newItem);
    } else if (mode === 'edit') {
        const index = priceList.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            priceList[index] = { ...priceList[index], service, description, price };
        }
    }
    
    savePriceList(priceList);
    loadPriceList();
    document.getElementById('price-modal').style.display = 'none';
}

function editPriceItem(id) {
    const priceList = getPriceList();
    const item = priceList.find(item => item.id === id);
    
    if (!item) return;
    
    const modal = document.getElementById('price-modal');
    const form = document.getElementById('price-form');
    
    document.getElementById('price-service').value = item.service;
    document.getElementById('price-description').value = item.description;
    document.getElementById('price-amount').value = item.price;
    
    form.setAttribute('data-mode', 'edit');
    form.setAttribute('data-id', id);
    document.getElementById('price-submit').textContent = 'Сохранить';
    
    modal.style.display = 'block';
}

function deletePriceItem(id) {
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) return;
    
    const priceList = getPriceList();
    const updatedList = priceList.filter(item => item.id !== id);
    
    savePriceList(updatedList);
    loadPriceList();
}

// Профиль
function initializeProfile() {
    if (document.getElementById('profile-content')) {
        loadProfile();
    }
}

function loadProfile() {
    const currentUser = getCurrentUser();
    const content = document.getElementById('profile-content');
    
    if (!currentUser) {
        content.innerHTML = '<p>Ошибка: пользователь не авторизован.</p>';
        return;
    }
    
    let html = `
        <h2>Профиль пользователя</h2>
        <p><strong>Имя:</strong> ${currentUser.name}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Username:</strong> ${currentUser.username}</p>
        <p><strong>Роль:</strong> ${currentUser.role === 'employee' ? 'Сотрудник СМИ' : 'Гражданин'}</p>
        <p><strong>Дата регистрации:</strong> ${formatDate(currentUser.registeredAt)}</p>
    `;
    
    if (currentUser.role === 'employee') {
        html += `
            <h3>Посты на модерации</h3>
            <div id="pending-posts-container"></div>
        `;
    } else {
        html += `
            <h3>Ваши предложенные посты</h3>
            <div id="user-posts-container"></div>
            <button id="suggest-post-btn" class="btn-primary">Предложить пост</button>
        `;
    }
    
    content.innerHTML = html;
    
    if (currentUser.role === 'employee') {
        loadPendingPosts();
    } else {
        loadUserPosts();
        document.getElementById('suggest-post-btn').addEventListener('click', showSuggestPostModal);
    }
    
    // Инициализация модалок для профиля
    if (currentUser.role === 'citizen') {
        initializeSuggestPostModal();
    }
}

function loadUserPosts() {
    const userPostsContainer = document.getElementById('user-posts-container');
    const currentUser = getCurrentUser();
    const pendingPosts = getPendingPosts().filter(post => post.authorId === currentUser.id);
    
    if (pendingPosts.length === 0) {
        userPostsContainer.innerHTML = '<p>У вас нет предложенных постов.</p>';
        return;
    }
    
    let postsHTML = '';
    pendingPosts.forEach(post => {
        postsHTML += `
            <div class="user-post">
                <div class="user-post-header">
                    <h4>${post.title}</h4>
                    <span class="post-status status-pending">На модерации</span>
                </div>
                <p>${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
                <p class="date">${formatDate(post.date)}</p>
            </div>
        `;
    });
    
    userPostsContainer.innerHTML = postsHTML;
}

function initializeSuggestPostModal() {
    const modal = document.getElementById('suggest-post-modal');
    const closeBtn = document.querySelector('#suggest-post-modal .close');
    const cancelBtn = document.getElementById('cancel-suggest');
    const form = document.getElementById('suggest-post-form');
    
    if (modal && closeBtn) {
        // Закрытие модального окна
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Закрытие при клике вне модального окна
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Обработка отправки формы
        form.addEventListener('submit', handleSuggestPostSubmit);
    }
}

function showSuggestPostModal() {
    const modal = document.getElementById('suggest-post-modal');
    const form = document.getElementById('suggest-post-form');
    
    // Сброс формы
    form.reset();
    
    modal.style.display = 'block';
}

function handleSuggestPostSubmit(e) {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    
    const title = document.getElementById('suggest-title').value;
    const content = document.getElementById('suggest-content').value;
    const category = document.getElementById('suggest-category').value;
    const media = document.getElementById('suggest-media').value;
    
    // Создание предложенного поста
    const newPost = {
        id: Date.now(),
        title: title,
        content: content,
        category: category,
        media: media || null,
        author: currentUser.name,
        authorId: currentUser.id,
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    const pendingPosts = getPendingPosts();
    pendingPosts.push(newPost);
    savePendingPosts(pendingPosts);
    
    // Обновляем профиль
    loadUserPosts();
    
    // Закрываем модальное окно
    document.getElementById('suggest-post-modal').style.display = 'none';
    
    alert('Ваш пост отправлен на модерацию. Спасибо!');
}

function loadPendingPosts() {
    const pendingPostsContainer = document.getElementById('pending-posts-container');
    const pendingPosts = getPendingPosts();
    
    if (pendingPosts.length === 0) {
        pendingPostsContainer.innerHTML = '<p>Нет постов на модерации.</p>';
        return;
    }
    
    let postsHTML = '';
    pendingPosts.forEach(post => {
        postsHTML += `
            <div class="user-post">
                <div class="user-post-header">
                    <h4>${post.title}</h4>
                    <span class="post-status status-pending">На модерации</span>
                </div>
                <p>${post.content}</p>
                <p class="date">Автор: ${post.author} | ${formatDate(post.date)}</p>
                <div class="post-actions">
                    <button class="btn-primary approve-post" data-id="${post.id}">Одобрить</button>
                    <button class="btn-secondary reject-post" data-id="${post.id}">Отклонить</button>
                </div>
            </div>
        `;
    });
    
    pendingPostsContainer.innerHTML = postsHTML;
    
    // Добавляем обработчики для кнопок одобрения и отклонения
    document.querySelectorAll('.approve-post').forEach(button => {
        button.addEventListener('click', function() {
            const postId = parseInt(this.getAttribute('data-id'));
            approvePost(postId);
        });
    });
    
    document.querySelectorAll('.reject-post').forEach(button => {
        button.addEventListener('click', function() {
            const postId = parseInt(this.getAttribute('data-id'));
            rejectPost(postId);
        });
    });
}

function approvePost(postId) {
    const pendingPosts = getPendingPosts();
    const postIndex = pendingPosts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) return;
    
    const post = pendingPosts[postIndex];
    
    // Меняем статус на опубликованный
    post.status = 'published';
    
    // Добавляем в опубликованные посты
    const posts = getPosts();
    posts.push(post);
    savePosts(posts);
    
    // Удаляем из ожидающих модерации
    pendingPosts.splice(postIndex, 1);
    savePendingPosts(pendingPosts);
    
    // Обновляем интерфейс
    loadPendingPosts();
    loadUserPosts();
    
    alert('Пост одобрен и опубликован!');
}

function rejectPost(postId) {
    if (!confirm('Вы уверены, что хотите отклонить этот пост?')) return;
    
    const pendingPosts = getPendingPosts();
    const updatedPendingPosts = pendingPosts.filter(p => p.id !== postId);
    
    savePendingPosts(updatedPendingPosts);
    loadPendingPosts();
    
    alert('Пост отклонен.');
}

// Вспомогательные функции
function currentUserCanEdit() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'employee';
}/* JS posts.js из примера */
