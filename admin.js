import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, orderBy, where, onSnapshot, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIGURAÇÃO ---
const firebaseConfig = {
    apiKey: "AIzaSyAsGP0Lu6d___A-cE83c_JSRjLhz-Yjq_s",
    authDomain: "muraldigital-71926js.firebaseapp.com",
    projectId: "muraldigital-71926js",
    storageBucket: "muraldigital-71926js.firebasestorage.app",
    messagingSenderId: "333628942808",
    appId: "1:333628942808:web:6b3af786c09f3061182aad"
};

// CHAVES GOOGLE DRIVE
const DRIVE_API_KEY = "AIzaSyCNzutFF79LkyLUGjeUS2jkwl9SYT8fcA8"; 
const FOLDER_ID = "1lcrGzoo8g8Nj6tehu0yQjx_5K79Gbwbn"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ESTADO ---
let lastClickedIndex = -1;

// --- ELEMENTOS ---
const gallery = document.getElementById('drive-gallery');
const selectionCount = document.getElementById('selection-count');
const btnPublish = document.getElementById('btn-publish-selected');
const activeList = document.getElementById('active-list');

// --- AUTH ---
onAuthStateChanged(auth, user => {
    if (user) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        loadDriveImages();
        monitorActiveItems();
    } else {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('admin-panel').style.display = 'none';
    }
});

document.getElementById('login-button').addEventListener('click', () => {
    signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value)
        .catch(e => document.getElementById('login-error').innerText = e.message);
});
document.getElementById('logout-button').addEventListener('click', () => signOut(auth));

// --- 1. DRIVE & SELEÇÃO ---


// --- 1. DRIVE & SELEÇÃO (CARREGAMENTO DE TODAS AS PÁGINAS) ---
window.loadDriveImages = async () => {
    gallery.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><br>Carregando todas as imagens da pasta...</p>';
    
    let allFiles = [];
    let pageToken = null;
    let keepFetching = true;

    try {
        // Loop para buscar todas as páginas de arquivos
        while (keepFetching) {
            // Monta a URL (Agora pedindo 1000 por vez para ser mais rápido)
            let url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&orderBy=createdTime desc&pageSize=1000&fields=nextPageToken,files(id,thumbnailLink)&key=${DRIVE_API_KEY}`;
            
            // Se tiver token de próxima página, adiciona na URL
            if (pageToken) {
                url += `&pageToken=${pageToken}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            if (data.files && data.files.length > 0) {
                allFiles = [...allFiles, ...data.files];
            }

            // Verifica se tem mais páginas
            if (data.nextPageToken) {
                pageToken = data.nextPageToken;
            } else {
                keepFetching = false;
            }
        }

        // --- RENDERIZAÇÃO APÓS CARREGAR TUDO ---
        gallery.innerHTML = '';
        document.getElementById('selection-count').innerText = "0"; // Reseta contador visual
        
        if (allFiles.length > 0) {
            // Atualiza texto do botão com total encontrado
            console.log(`${allFiles.length} imagens carregadas.`);
            
            allFiles.forEach((file, index) => {
                const div = document.createElement('div');
                div.className = 'img-selectable h-24 w-full bg-cover bg-center rounded bg-gray-200 cursor-pointer transition-all hover:opacity-80 relative border-2 border-transparent';
                
                // Ajuste para garantir melhor resolução na thumb se possível
                div.style.backgroundImage = `url('${file.thumbnailLink}')`;
                div.dataset.id = file.id;
                
                // Adiciona indicador visual de seleção
                div.innerHTML = `<div class="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full hidden check-indicator border border-white"></div>`;
                
                div.addEventListener('click', (e) => handleSelection(e, index));
                gallery.appendChild(div);
            });
        } else {
            gallery.innerHTML = '<p class="col-span-full text-center text-sm py-10">Nenhuma imagem encontrada nesta pasta.</p>';
        }

    } catch (error) {
        console.error(error);
        gallery.innerHTML = `<div class="col-span-full text-center py-10">
            <p class="text-red-500 font-bold">Erro ao carregar imagens:</p>
            <p class="text-xs text-gray-600 mt-2">${error.message}</p>
        </div>`;
    }
};


/* com 100 fotos
window.loadDriveImages = async () => {
    gallery.innerHTML = '<p class="col-span-full text-center py-10"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>';
    
    // Pega as mais recentes primeiro
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&orderBy=createdTime desc&pageSize=100&fields=files(id,thumbnailLink)&key=${DRIVE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        gallery.innerHTML = '';
        if (data.files && data.files.length > 0) {
            data.files.forEach((file, index) => {
                const div = document.createElement('div');
                div.className = 'img-selectable h-24 w-full bg-cover bg-center rounded bg-gray-200';
                div.style.backgroundImage = `url('${file.thumbnailLink}')`;
                div.dataset.id = file.id;
                
                div.addEventListener('click', (e) => handleSelection(e, index));
                gallery.appendChild(div);
            });
        } else {
            gallery.innerHTML = '<p class="col-span-full text-center text-sm">Nenhuma imagem.</p>';
        }
    } catch (error) {
        gallery.innerHTML = `<p class="col-span-full text-red-500 text-xs">${error.message}</p>`;
    }
};
*/

document.getElementById('btn-refresh-drive').addEventListener('click', loadDriveImages);

function handleSelection(e, index) {
    const cards = gallery.children;
    const isSelected = cards[index].classList.contains('selected');

    if (e.shiftKey && lastClickedIndex !== -1) {
        const start = Math.min(lastClickedIndex, index);
        const end = Math.max(lastClickedIndex, index);
        for (let i = start; i <= end; i++) cards[i].classList.add('selected');
    } else if (e.ctrlKey || e.metaKey) {
        cards[index].classList.toggle('selected');
        lastClickedIndex = index;
    } else {
        // Toggle simples para facilitar
        cards[index].classList.toggle('selected');
        lastClickedIndex = index;
    }
    updateCounter();
}

window.selectAll = () => { Array.from(gallery.children).forEach(el => el.classList.add('selected')); updateCounter(); };
window.deselectAll = () => { Array.from(gallery.children).forEach(el => el.classList.remove('selected')); updateCounter(); };

function updateCounter() {
    const count = gallery.querySelectorAll('.selected').length;
    selectionCount.innerText = count;
    
    if (count > 0) {
        btnPublish.classList.remove('opacity-50', 'cursor-not-allowed');
        btnPublish.innerText = `PUBLICAR ${count} SLIDES`;
    } else {
        btnPublish.classList.add('opacity-50', 'cursor-not-allowed');
        btnPublish.innerText = "SELECIONE FOTOS";
    }
}

// --- 2. PUBLICAR NO FIREBASE (COM DADOS DO FORMULÁRIO) ---
btnPublish.addEventListener('click', async () => {
    const selectedEls = gallery.querySelectorAll('.selected');
    if (selectedEls.length === 0) return;

    btnPublish.innerText = "Enviando...";

    // 1. Pega os valores do painel de configuração em lote
    const bulkText = document.getElementById('bulk-text').value;
    const bulkDuration = parseInt(document.getElementById('bulk-duration').value) || 5;
    const bulkStart = document.getElementById('bulk-start').value;
    const bulkEnd = document.getElementById('bulk-end').value;

    const batch = writeBatch(db);
    
    // Pega ordem base (aproximada, timestamp cuida da ordem real se precisar)
    const now = Date.now(); 

    selectedEls.forEach((el, i) => {
        const ref = doc(collection(db, "mural"));
        
        batch.set(ref, {
            type: 'image',
            fileId: el.dataset.id,
            thumbnail: '', 
            text: bulkText,        // APLICA O TEXTO EM TODAS
            duration: bulkDuration,// APLICA A DURAÇÃO EM TODAS
            startTime: bulkStart,  // APLICA O INICIO
            endTime: bulkEnd,      // APLICA O FIM
            order: now + i,        // Ordem baseada no tempo pra ficar no final
            createdAt: serverTimestamp()
        });
    });

    await batch.commit();
    deselectAll();
    
    // Limpa campos opcionais para não confundir na proxima
    document.getElementById('bulk-text').value = '';
});

// --- 3. MONITORAR E RENDERIZAR ATIVOS (COM BOTÃO EDITAR) ---
function monitorActiveItems() {
    // Ordena por ordem ou createdAt
    const q = query(collection(db, "mural"), orderBy("order")); 
    
    onSnapshot(q, snap => {
        activeList.innerHTML = '';
        document.getElementById('active-count').innerText = snap.size;

        snap.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            
            // Cria o Card do Slide Ativo
            const card = document.createElement('div');
            card.className = "bg-white p-3 rounded shadow-sm border border-gray-200 flex gap-3 items-center group";
            
            // Miniatura ou Ícone
            let thumb = '';
            if(d.type === 'image' && d.fileId) {
                // Link Google Thumb
                thumb = `<img src="https://lh3.googleusercontent.com/d/${d.fileId}=s120" class="w-16 h-16 object-cover rounded bg-gray-200">`;
            } else {
                thumb = `<div class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded text-xl">📝</div>`;
            }

            // Info de Tempo
            const timeInfo = (d.startTime && d.endTime) 
                ? `<span class="text-[10px] bg-green-100 text-green-800 px-1 rounded ml-1">🕒 ${d.startTime}-${d.endTime}</span>` 
                : '';

            card.innerHTML = `
                <div class="font-bold text-gray-400 text-xs cursor-move">#${d.order.toString().slice(-3)}</div>
                ${thumb}
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate" title="${d.text || ''}">${d.text || 'Sem legenda'}</p>
                    <div class="text-xs text-gray-500 mt-1">
                        ⏱️ ${d.duration}s ${timeInfo}
                    </div>
                </div>
                <div class="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button class="bg-blue-50 text-blue-600 p-1 rounded hover:bg-blue-100 text-xs font-bold w-16" onclick="window.editItem('${id}')">EDITAR</button>
                    <button class="bg-red-50 text-red-600 p-1 rounded hover:bg-red-100 text-xs font-bold w-16" onclick="window.deleteItem('${id}')">X</button>
                </div>
            `;
            activeList.appendChild(card);
            
            // Salva dados no elemento para facilitar edição
            card.dataset.json = JSON.stringify({id, ...d});
        });
    });
}

// --- 4. FUNÇÕES GLOBAIS (TEXTO, LIMPEZA, DELETE) ---

// Aviso Rápido (Texto)
document.getElementById('btn-send-text').addEventListener('click', async () => {
    const txt = document.getElementById('manual-text').value;
    if(!txt) return;
    await addDoc(collection(db, "mural"), {
        type: 'text',
        text: txt,
        duration: 10,
        order: Date.now(),
        createdAt: serverTimestamp()
    });
    document.getElementById('manual-text').value = '';
});

// Limpar Fotos
document.getElementById('btn-wipe-photos').addEventListener('click', async () => {
    if(!confirm("CUIDADO: Isso apagará todas as FOTOS do ar. Confirmar?")) return;
    const q = query(collection(db, "mural"), where("type", "==", "image"));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();
});

window.deleteItem = async (id) => {
    if(confirm("Excluir este item?")) await deleteDoc(doc(db, "mural", id));
}

// --- 5. LÓGICA DO MODAL DE EDIÇÃO (RESTAURADO) ---
const editModal = document.getElementById('editModal');

window.editItem = (id) => {
    // Acha o slide na memória (mais rápido que buscar no banco de novo)
    // Precisamos buscar o dado atualizado, vamos usar um getDoc rápido ou achar no DOM se salvamos lá
    // Para simplificar, vamos buscar o doc do firestore para garantir
    // (Ou podemos pegar do DOM se salvamos no dataset, vou usar a busca para ser seguro)
    
    // Truque: vamos pegar do active-list renderizado se possível ou snapshot
    // Melhor: Busca no firestore rapidinho
    getDocById(id);
};

async function getDocById(id) {
    // Provisório: Buscar no array local seria melhor, mas vamos fazer fetch direto do elemento
    // Vou iterar no activeList para achar o dataset que salvei
    const card = Array.from(activeList.children).find(c => {
        const data = JSON.parse(c.dataset.json || '{}');
        return data.id === id;
    });

    if(card) {
        const data = JSON.parse(card.dataset.json);
        fillModal(data);
    }
}

function fillModal(data) {
    document.getElementById('edit-id').value = data.id;
    document.getElementById('edit-order').value = data.order || 0;
    document.getElementById('edit-text').value = data.text || '';
    document.getElementById('edit-duration').value = data.duration || 5;
    document.getElementById('edit-type').value = data.type;
    document.getElementById('edit-start').value = data.startTime || '';
    document.getElementById('edit-end').value = data.endTime || '';
    
    editModal.classList.remove('hidden');
    editModal.classList.add('flex');
}

document.getElementById('close-modal').addEventListener('click', () => {
    editModal.classList.add('hidden');
    editModal.classList.remove('flex');
});

document.getElementById('save-edit').addEventListener('click', async () => {
    const id = document.getElementById('edit-id').value;
    
    const updateData = {
        order: parseInt(document.getElementById('edit-order').value),
        text: document.getElementById('edit-text').value,
        duration: parseInt(document.getElementById('edit-duration').value),
        startTime: document.getElementById('edit-start').value,
        endTime: document.getElementById('edit-end').value
    };

    await updateDoc(doc(db, "mural", id), updateData);
    
    editModal.classList.add('hidden');
    editModal.classList.remove('flex');
});