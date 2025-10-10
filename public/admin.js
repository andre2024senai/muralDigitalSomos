// admin.js - VERSÃO 2.0 COM TODAS AS MELHORIAS

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIGURAÇÃO (PREENCHA SEUS DADOS) ---
const firebaseConfig = {
    apiKey: "AIzaSyBcqH_y5tkutXcE-ONiuGOrDsNbr1AmgQg",
    authDomain: "muraldigital-71926.firebaseapp.com",
    projectId: "muraldigital-71926",
    storageBucket: "muraldigital-71926.firebasestorage.app",
    messagingSenderId: "1096787707963",
    appId: "1:1096787707963:web:d79b209180d9d09ac9741e",
    measurementId: "G-3VL7F39ZTK"
};
const GOOGLE_DRIVE_API_KEY = "AIzaSyBcqH_y5tkutXcE-ONiuGOrDsNbr1AmgQg"; // <-- PREENCHA
const FOLDER_ID = "1lcrGzoo8g8Nj6tehu0yQjx_5K79Gbwbn"; // <-- PREENCHA

// --- INICIALIZAÇÃO ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ELEMENTOS DA PÁGINA ---
const loginScreen = document.getElementById('login-screen');
const adminPanel = document.getElementById('admin-panel');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const imageListDiv = document.getElementById('image-list');
const announcementForm = document.getElementById('announcement-form');
const orderInput = document.getElementById('announcement-order');
const currentSlidesList = document.getElementById('current-slides-list');

// --- ESTADO GLOBAL ---
let lastSelectedIndex = -1;
let currentSlidesData = []; // Guarda os dados dos slides atuais

// --- LÓGICA DE AUTENTICAÇÃO ---
onAuthStateChanged(auth, user => {
    if (user) {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'block';
        fetchImagesFromDrive();
        renderCurrentSlides();
    } else {
        loginScreen.style.display = 'block';
        adminPanel.style.display = 'none';
    }
});
loginButton.addEventListener('click', () => signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value).catch(err => loginError.textContent = err.message));
logoutButton.addEventListener('click', () => signOut(auth));

// --- LÓGICA DO GOOGLE DRIVE COM SELEÇÃO AVANÇADA ---
async function fetchImagesFromDrive() {
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents and (mimeType='image/jpeg' or mimeType='image/png')&fields=files(id,name,thumbnailLink)&key=${GOOGLE_DRIVE_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API do Google Drive: ${response.statusText}`);
        const data = await response.json();
        imageListDiv.innerHTML = '';
        if (data.files && data.files.length > 0) {
            data.files.forEach((file, index) => {
                const img = document.createElement('img');
                img.src = file.thumbnailLink;
                img.title = file.name;
                img.dataset.fileId = file.id;
                img.dataset.index = index;

                img.addEventListener('click', (e) => handleImageSelection(e, index));
                imageListDiv.appendChild(img);
            });
        } else {
            imageListDiv.textContent = 'Nenhuma imagem encontrada na pasta.';
        }
    } catch (error) {
        imageListDiv.textContent = `Falha ao carregar imagens: ${error.message}`;
    }
}

function handleImageSelection(e, currentIndex) {
    const allImages = Array.from(imageListDiv.children);
    const targetImg = allImages[currentIndex];

    if (e.ctrlKey) { // Seleção com CTRL: adiciona ou remove da seleção
        targetImg.classList.toggle('selected');
    } else if (e.shiftKey && lastSelectedIndex !== -1) { // Seleção com SHIFT: seleciona um intervalo
        const start = Math.min(currentIndex, lastSelectedIndex);
        const end = Math.max(currentIndex, lastSelectedIndex);
        allImages.forEach((img, index) => {
            if (index >= start && index <= end) {
                img.classList.add('selected');
            } else {
                img.classList.remove('selected');
            }
        });
    } else { // Seleção normal: seleciona apenas um
        allImages.forEach(img => img.classList.remove('selected'));
        targetImg.classList.add('selected');
    }
    lastSelectedIndex = currentIndex;
}


// --- LÓGICA DO FIRESTORE (SALVAR E EXIBIR) ---

// SALVAR AVISOS
announcementForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('announcement-text').value;
    let startOrder = parseInt(orderInput.value);
    const DURATION_FIXED = 5; // Duração fixa em 5 segundos
    const selectedImages = document.querySelectorAll('#image-list img.selected');

    const existingOrders = currentSlidesData.map(slide => slide.order);
    if (existingOrders.includes(startOrder) && selectedImages.length <= 1) {
        alert(`Erro: A ordem ${startOrder} já está em uso. Por favor, escolha outra.`);
        return;
    }

    try {
        const batch = writeBatch(db);
        if (selectedImages.length > 0) { // Salva um slide por imagem
            selectedImages.forEach((img, index) => {
                const docRef = doc(collection(db, 'mural')); // Cria uma referência para um novo documento
                batch.set(docRef, {
                    text: text,
                    order: startOrder + index,
                    duration: DURATION_FIXED,
                    type: 'image',
                    fileId: img.dataset.fileId,
                    thumbnail: img.src,
                    createdAt: serverTimestamp()
                });
            });
        } else if (text) { // Salva apenas um slide de texto
            const docRef = doc(collection(db, 'mural'));
            batch.set(docRef, { text, order: startOrder, duration: DURATION_FIXED, type: 'text', createdAt: serverTimestamp() });
        } else {
            alert("Selecione pelo menos uma imagem ou digite um texto.");
            return;
        }

        await batch.commit(); // Envia todas as operações de uma vez
        alert("Aviso(s) salvo(s) com sucesso!");
        announcementForm.reset();
        selectedImages.forEach(img => img.classList.remove('selected'));
        // A lista se atualizará automaticamente pelo onSnapshot
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Ocorreu um erro ao salvar os avisos.");
    }
});


// EXIBIR E REORDENAR AVISOS ATUAIS
function renderCurrentSlides() {
    const q = query(collection(db, "mural"), orderBy("order"));
    onSnapshot(q, snapshot => {
        currentSlidesList.innerHTML = '';
        currentSlidesData = []; // Limpa e preenche novamente
        
        snapshot.forEach(docSnap => {
            const slide = docSnap.data();
            slide.id = docSnap.id; // Adiciona o ID do documento ao objeto
            currentSlidesData.push(slide);

            const li = document.createElement('li');
            li.className = 'list-group-item slide-item';
            li.dataset.id = slide.id; // Guarda o ID do documento no elemento HTML

            const thumbnailHtml = slide.type === 'image'
                ? `<img src="${slide.thumbnail}" alt="thumbnail">`
                : '<div style="width:90px; height:60px; background:#eee; display:flex; align-items:center; justify-content:center; border-radius:4px;"><span class="text-muted">Texto</span></div>';

            li.innerHTML = `
                <span><strong>${slide.order}.</strong></span>
                ${thumbnailHtml}
                <span class="flex-grow-1">${slide.text || '<em>Apenas imagem</em>'}</span>
                <button class="btn btn-sm btn-outline-danger btn-delete">&times;</button>
            `;
            li.querySelector('.btn-delete').onclick = () => deleteSlide(slide.id);
            currentSlidesList.appendChild(li);
        });

        // Atualiza a sugestão de ordem no formulário
        const maxOrder = currentSlidesData.reduce((max, p) => p.order > max ? p.order : max, 0);
        orderInput.value = maxOrder + 1;

        // Inicializa a funcionalidade de arrastar e soltar
        new Sortable(currentSlidesList, {
            animation: 150,
            onEnd: handleDragEnd
        });
    });
}

// Função chamada quando o usuário termina de arrastar um item
async function handleDragEnd(evt) {
    const items = Array.from(evt.target.children);
    const batch = writeBatch(db);

    items.forEach((item, index) => {
        const docId = item.dataset.id;
        const newOrder = index + 1;
        const docRef = doc(db, 'mural', docId);
        batch.update(docRef, { order: newOrder });
    });

    try {
        await batch.commit();
        console.log("Ordem atualizada com sucesso!");
    } catch (error) {
        console.error("Erro ao reordenar:", error);
    }
}


// APAGAR UM SLIDE
async function deleteSlide(docId) {
    if (confirm("Tem certeza que deseja apagar este aviso?")) {
        await deleteDoc(doc(db, 'mural', docId));
    }
}


