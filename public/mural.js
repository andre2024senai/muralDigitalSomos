// mural.js - VERSÃO CORRETA E COMPLETA

// Importa as funções do Firebase que vamos usar
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Sua configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBcqH_y5tkutXcE-ONiuGOrDsNbr1AmgQg",
    authDomain: "muraldigital-71926.firebaseapp.com",
    projectId: "muraldigital-71926",
    storageBucket: "muraldigital-71926.firebasestorage.app",
    messagingSenderId: "1096787707963",
    appId: "1:1096787707963:web:d79b209180d9d09ac9741e",
    measurementId: "G-3VL7F39ZTK"
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elementos da página
const container = document.getElementById('mural-container');
let slides = [];
let currentSlideIndex = 0;
let slideInterval; // Guarda a referência do nosso temporizador

// Função para exibir o próximo slide
function showNextSlide() {
    if (slides.length === 0) return;

    // Remove a classe 'active' do slide que está saindo
    const currentActive = document.querySelector('.slide.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }

    // Avança para o próximo slide
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    const nextSlideElement = document.getElementById(`slide-${currentSlideIndex}`);
    
    // Adiciona a classe 'active' ao novo slide para que ele apareça
    if (nextSlideElement) {
        nextSlideElement.classList.add('active');
    }
    
    // Pega a duração específica deste slide (ou usa 10s como padrão)
    const slideDuration = slides[currentSlideIndex]?.duration || 10;
    
    // Limpa o timer antigo e cria um novo com a duração do slide atual
    if (slideInterval) clearTimeout(slideInterval);
    slideInterval = setTimeout(showNextSlide, slideDuration * 1000);
}

// Cria a consulta para buscar os avisos do mural, ordenados pelo campo 'order'
const muralQuery = query(collection(db, "mural"), orderBy("order"));

// Ouve as atualizações da coleção 'mural' no Firestore EM TEMPO REAL
onSnapshot(muralQuery, (querySnapshot) => {
    console.log("Dados do mural recebidos ou atualizados!");
    
    // Limpa o conteúdo e o timer anterior para recomeçar
    if (slideInterval) clearTimeout(slideInterval);
    container.innerHTML = '';
    slides = [];

    querySnapshot.forEach((doc) => {
        slides.push(doc.data());
    });

    if (slides.length > 0) {
        // Cria os elementos HTML para cada slide
        slides.forEach((slideData, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'slide';
            slideElement.id = `slide-${index}`;
            
            // Se for do tipo imagem e tiver um ID de arquivo, define como fundo
            if (slideData.type === 'image' && slideData.fileId) {
                const imageUrl = `https://lh3.googleusercontent.com/d/${slideData.fileId}`;
                slideElement.style.backgroundImage = `url('${imageUrl}')`;
            }
            
            // Se tiver texto, cria o elemento de texto
            if (slideData.text) {
                const content = document.createElement('div');
                content.className = 'slide-content';
                content.innerHTML = `<h1>${slideData.text}</h1>`;
                slideElement.appendChild(content);
            }
            container.appendChild(slideElement);
        });

        // Reinicia o slideshow do zero
        currentSlideIndex = -1;
        showNextSlide();
    }
});