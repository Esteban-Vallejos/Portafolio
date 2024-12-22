const btn = document.getElementById('button');
const sectionAll = document.querySelectorAll('section[id]');
const inputName = document.querySelector('#nombre');
const inputEmail = document.querySelector('#email');
const flagsElement = document.getElementById('flags');
const textsToChange = document.querySelectorAll('[data-section]');

/* ===== Loader =====*/
window.addEventListener('load', () => {
    const contenedorLoader = document.querySelector('.container--loader');
    contenedorLoader.style.opacity = 0;
    contenedorLoader.style.visibility = 'hidden';
});

/*===== Header =====*/
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.classList.toggle('abajo', window.scrollY > 0);
});

/*===== Boton Menu =====*/
btn.addEventListener('click', function() {
    if (this.classList.contains('active')) {
        this.classList.remove('active');
        this.classList.add('not-active');
        document.querySelector('.nav_menu').classList.remove('active');
        document.querySelector('.nav_menu').classList.add('not-active');
    }
    else {
        this.classList.add('active');
        this.classList.remove('not-active');
        document.querySelector('.nav_menu').classList.remove('not-active');
        document.querySelector('.nav_menu').classList.add('active');
    }
});

/*===== Cambio de idioma =====*/
const changeLanguage = async language => {
    const requestJson = await fetch(`./languages/${language}.json`);
    const texts = await requestJson.json();

    for(const textToChange of textsToChange) {
        const section = textToChange.dataset.section;
        const value = textToChange.dataset.value;

        textToChange.innerHTML = texts[section][value];
    }
};

flagsElement.addEventListener('click', (e) => {
    changeLanguage(e.target.parentElement.dataset.language);
});

/*===== class active por secciones =====*/
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sectionAll.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY < sectionTop + sectionHeight) {
            document.querySelector('nav a[href*=' + sectionId + ']').classList.add('active');
        }
        else {
            document.querySelector('nav a[href*=' + sectionId + ']').classList.remove('active');
        }
    });
});

/*===== Boton y función ir arriba =====*/
window.onscroll = function() {
    if (document.documentElement.scrollTop > 100) {
        document.querySelector('.go-top-container').classList.add('show');
    }
    else {
        document.querySelector('.go-top-container').classList.remove('show');
    }
};

document.querySelector('.go-top-container').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// /*===== Script de contacto =====*/
document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        affair: document.getElementById('asunto').value,
        message: document.getElementById('mensaje').value
    };

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        mostrarMensaje(response.ok ? 'success' : 'error', response.ok ? 'Mensaje enviado con éxito' : 'Error al enviar el mensaje');
        
        if (response.ok) {
            document.getElementById('form').reset();
        }

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('error', 'Error al enviar el mensaje');
    }
});

function mostrarMensaje(tipo, texto) {
    // Crear o obtener el elemento de mensaje
    let mensajeElement = document.getElementById('mensaje-estado');
    if (!mensajeElement) {
        mensajeElement = document.createElement('div');
        mensajeElement.id = 'mensaje-estado';
        mensajeElement.className = 'mensaje-estado';
        document.body.appendChild(mensajeElement);
    }

    // Limpiar clases anteriores
    mensajeElement.className = 'mensaje-estado';
    
    // Agregar clases según el tipo
    mensajeElement.classList.add(tipo === 'success' ? 'exito' : 'error');
    mensajeElement.textContent = texto;

    // Mostrar el mensaje
    setTimeout(() => mensajeElement.classList.add('mostrar'), 10);

    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
        mensajeElement.classList.remove('mostrar');
        setTimeout(() => {
            mensajeElement.remove();
        }, 300);
    }, 3000);
}