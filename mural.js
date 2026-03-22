import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== WIDGET DE TEMPERATURA — PAINEL LATERAL =====

const CITIES = [
    { name: "Jaraguá do Sul",    lat: -26.4854, lon: -49.0711 },
    { name: "Guaramirim",        lat: -26.4731, lon: -49.0080 },
    { name: "Joinville",         lat: -26.3045, lon: -48.8487 },
    { name: "Blumenau",          lat: -26.9194, lon: -49.0661 },
    { name: "Balneário Camboriú",lat: -26.9906, lon: -48.6348 },
    { name: "Barra Velha",       lat: -26.6329, lon: -48.6848 },
    { name: "Schroeder",         lat: -26.4200, lon: -49.0700 },
];

// Armazena os dados de clima já carregados: [{ temp, emoji }, ...]
let weatherData = new Array(CITIES.length).fill(null);
let weatherLoaded = false;

function weatherCodeToEmoji(code) {
    if (code === 0)    return "☀️";
    if (code <= 2)     return "🌤️";
    if (code === 3)    return "☁️";
    if (code <= 49)    return "🌫️";
    if (code <= 59)    return "🌧️";
    if (code <= 69)    return "🌦️";
    if (code <= 79)    return "❄️";
    if (code <= 82)    return "🌧️";
    if (code <= 86)    return "🌨️";
    if (code <= 99)    return "⛈️";
    return "🌡️";
}

// Atualiza o painel direito com os dados da cidade pelo índice
function updateWeatherPanel(cityIndex) {
    const idx = cityIndex % CITIES.length;
    const city = CITIES[idx];
    const data = weatherData[idx];

    const emojiEl  = document.getElementById('weather-emoji');
    const tempEl   = document.getElementById('weather-temp');
    const minEl    = document.getElementById('weather-min');
    const maxEl    = document.getElementById('weather-max');
    const cityEl   = document.getElementById('weather-city');
    const minmaxEl = document.getElementById('weather-minmax');

    if (!emojiEl || !tempEl || !cityEl) return;

    // Animação de fade ao trocar
    [emojiEl, tempEl, minmaxEl, cityEl].forEach(el => {
        if (!el) return;
        el.classList.remove('weather-fade');
        void el.offsetWidth; // força reflow para reiniciar animação
        el.classList.add('weather-fade');
    });

    if (data) {
        emojiEl.textContent = data.emoji;
        tempEl.textContent  = `${data.temp}°C`;
        if (minEl) minEl.textContent = `${data.tempMin}°`;
        if (maxEl) maxEl.textContent = `${data.tempMax}°`;
        cityEl.textContent  = city.name;
    } else {
        emojiEl.textContent = "🌡️";
        tempEl.textContent  = "--°";
        if (minEl) minEl.textContent = "--°";
        if (maxEl) maxEl.textContent = "--°";
        cityEl.innerHTML    = `<span id="weather-loading-msg">${city.name}</span>`;
    }
}

// Busca temperaturas de todas as cidades em paralelo
async function fetchWeatherData() {
    try {
        const requests = CITIES.map(city =>
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo`)
                .then(r => r.json())
        );

        const results = await Promise.all(requests);

        results.forEach((data, i) => {
            const temp  = data?.current?.temperature_2m;
            const code  = data?.current?.weather_code ?? 0;
            const tMax  = data?.daily?.temperature_2m_max?.[0];
            const tMin  = data?.daily?.temperature_2m_min?.[0];

            weatherData[i] = {
                temp:    temp !== undefined ? Math.round(temp) : null,
                tempMax: tMax !== undefined ? Math.round(tMax) : null,
                tempMin: tMin !== undefined ? Math.round(tMin) : null,
                emoji:   weatherCodeToEmoji(code),
            };
        });

        weatherLoaded = true;
        console.log(`[Clima] Atualizado: ${new Date().toLocaleTimeString('pt-BR')}`);

        // Atualiza o painel com a cidade do slide atual
        updateWeatherPanel(currentSlideIndex);

    } catch (err) {
        console.warn('[Clima] Falha ao buscar temperatura:', err);
    }
}

// Busca ao iniciar e a cada 10 minutos
fetchWeatherData();
setInterval(fetchWeatherData, 10 * 60 * 1000);

// ===== FIM WIDGET DE TEMPERATURA =====




const firebaseConfig = {
    apiKey: "AIzaSyAsGP0Lu6d___A-cE83c_JSRjLhz-Yjq_s",
    authDomain: "muraldigital-71926js.firebaseapp.com",
    projectId: "muraldigital-71926js",
    storageBucket: "muraldigital-71926js.firebasestorage.app",
    messagingSenderId: "333628942808",
    appId: "1:333628942808:web:6b3af786c09f3061182aad"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const container = document.getElementById('mural-container');
let allDocs = []; // Armazena todos os documentos brutos
let activePlaylist = []; // Armazena apenas o que deve passar AGORA
let currentSlideIndex = 0;
let slideInterval; 

// --- 1. FUNÇÃO QUE FILTRA O QUE DEVE RODAR ---
function updatePlaylist() {
    const now = new Date();
    // Pega hora atual formato HH:MM (ex: 19:30)
    const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let scheduledSlides = [];
    let standardSlides = [];

    // Separa os slides em dois baldes
    allDocs.forEach(data => {
        if (data.startTime && data.endTime) {
            // É um slide agendado, verifica se é AGORA
            if (currentTime >= data.startTime && currentTime <= data.endTime) {
                scheduledSlides.push(data);
            }
        } else {
            // É um slide normal (sem horário)
            standardSlides.push(data);
        }
    });

    // --- A MÁGICA DA PRIORIDADE ---
    // Se tiver slides agendados para AGORA, toca SÓ eles.
    // Caso contrário, toca os normais.
    if (scheduledSlides.length > 0) {
        console.log(`Modo Agendamento Ativo: ${scheduledSlides.length} slides.`);
        activePlaylist = scheduledSlides;
    } else {
        console.log(`Modo Padrão: ${standardSlides.length} slides.`);
        activePlaylist = standardSlides;
    }

    // Se a playlist estava vazia e agora tem coisa, ou se mudou drasticamente, reinicia o show
    // (Mas tentamos não interromper o slide atual se possível, aqui vamos reiniciar para garantir)
}

// --- 2. RENDERIZAÇÃO DOS SLIDES ---
function renderSlides() {
    container.innerHTML = ''; // Limpa tela

    if (activePlaylist.length === 0) {
        container.innerHTML = '<h1 style="color:white; text-align:center; margin-top: 20%; opacity: 0.5;">Aguardando programação...</h1>';
        return;
    }

    activePlaylist.forEach((slideData, index) => {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide';
        slideElement.id = `slide-${index}`;

        // TIPO: IMAGEM
        if (slideData.type === 'image') {
            let finalUrl = `https://lh3.googleusercontent.com/d/${slideData.fileId}=s3000`;
            if (!slideData.fileId && slideData.thumbnail) finalUrl = slideData.thumbnail;
            slideElement.style.backgroundImage = `url('${finalUrl}')`;
        }
        // TIPO: YOUTUBE
        else if (slideData.type === 'youtube' && slideData.videoId) {
            slideElement.innerHTML = `
                <iframe width="100%" height="100%" 
                    src="https://www.youtube.com/embed/${slideData.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${slideData.videoId}" 
                    frameborder="0" allow="autoplay; encrypted-media" allowfullscreen 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                </iframe>`;
        }

        // TEXTO (Estrutura ajustada para o CSS do index.html)
        if (slideData.text) {
            const content = document.createElement('div');
            content.className = 'slide-content';
            content.innerHTML = `<h1>${slideData.text}</h1>`;
            slideElement.appendChild(content);
        }
        container.appendChild(slideElement);
    });

    // Reinicia o loop visual
    currentSlideIndex = -1;
    showNextSlide();
}

function showNextSlide() {
    if (activePlaylist.length === 0) return;

    const currentActive = document.querySelector('.slide.active');
    if (currentActive) currentActive.classList.remove('active');

    currentSlideIndex = (currentSlideIndex + 1) % activePlaylist.length;
    
    // Tenta pegar o elemento. Se a playlist mudou e o index não existe mais, volta pro 0
    let nextSlideElement = document.getElementById(`slide-${currentSlideIndex}`);
    if (!nextSlideElement) {
        currentSlideIndex = 0;
        nextSlideElement = document.getElementById(`slide-${0}`);
    }

    if (nextSlideElement) nextSlideElement.classList.add('active');

    // Atualiza o painel de clima com a cidade correspondente ao slide atual
    updateWeatherPanel(currentSlideIndex);

    // Duração
    let durationSec = Number(activePlaylist[currentSlideIndex]?.duration) || 5;
    
    if (slideInterval) clearTimeout(slideInterval);
    slideInterval = setTimeout(showNextSlide, durationSec * 1000);
}

// --- 3. ESCUTA O BANCO DE DADOS ---
const muralQuery = query(collection(db, "mural"), orderBy("order"));

onSnapshot(muralQuery, (querySnapshot) => {
    allDocs = [];
    querySnapshot.forEach((doc) => {
        allDocs.push(doc.data());
    });
    
    // Calcula o que deve passar agora e renderiza
    updatePlaylist();
    renderSlides();

}, (error) => {
    console.error("Erro:", error);
    setTimeout(() => window.location.reload(), 10000); // Recarrega se cair net
});

// --- 4. VERIFICAÇÃO DE HORÁRIO AUTOMÁTICA ---
// Verifica a cada 30 segundos se mudou o horário (ex: deu 19:00) para trocar a playlist
setInterval(() => {
    const oldPlaylistJSON = JSON.stringify(activePlaylist);
    updatePlaylist();
    const newPlaylistJSON = JSON.stringify(activePlaylist);

    // Se a playlist mudou por causa do horário, renderiza de novo
    if (oldPlaylistJSON !== newPlaylistJSON) {
        console.log("Horário mudou a programação. Atualizando tela...");
        renderSlides();
    }
}, 30000);