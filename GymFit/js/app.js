// GymFit - Sistema de Academia Completo

// Instância global do app
let app = null;

// Classe principal do aplicativo
class GymFitApp {
    constructor() {
        // Inicialização dos dados
        this.currentUser = null;
        this.users = this.getFromStorage('gymfit_users', []);
        this.treinos = this.getFromStorage('gymfit_treinos', []);
        this.desafios = this.getFromStorage('gymfit_desafios', []);
        this.atividades = this.getFromStorage('gymfit_atividades', []);
        
        // Inicializar a aplicação
        this.init();
        // Carregar tema imediatamente após a inicialização
        this.loadTheme();
    }

    // Método auxiliar para obter dados do localStorage
    getFromStorage(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Erro ao ler ${key} do localStorage:`, error);
            return defaultValue;
        }
    }

    // Método auxiliar para salvar dados no localStorage
    saveToStorage(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            return true;
        } catch (error) {
            console.error(`Erro ao salvar ${key} no localStorage:`, error);
            return false;
        }
    }

    init() {
        console.log('Inicializando GymFit App...');
        this.setupEventListeners();
        this.checkAuth();
        this.setupMobileMenu();
        this.renderHome();
        console.log('GymFit App inicializado com sucesso!');
    }

    // Configurar Event Listeners
    setupEventListeners() {
        // Navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('href').substring(1);
                this.showPage(page);
                });
            });

        // Logo - voltar ao home
        const logoLink = document.getElementById('logoLink');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('home');
            });
        }

        // Botões de autenticação
        ['btnLoginHeader', 'btnCadastroHeader', 'btnLogout'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                e.preventDefault();
                    if (id === 'btnLogout') {
                        this.logout();
                    } else {
                        this.showPage(id === 'btnLoginHeader' ? 'login' : 'cadastro');
                    }
                });
            }
        });

        // Formulários
        ['loginForm', 'cadastroForm', 'treino-form', 'desafio-form'].forEach(id => {
            const form = document.getElementById(id);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    switch(id) {
                        case 'loginForm': this.handleLogin(e); break;
                        case 'cadastroForm': this.handleCadastro(e); break;
                        case 'treino-form': this.handleCriarTreino(e); break;
                        case 'desafio-form': this.handleCriarDesafio(e); break;
                    }
                });
            }
        });

        // Botões específicos
        const addExercicio = document.getElementById('addExercicio');
        if (addExercicio) {
            addExercicio.addEventListener('click', () => this.addExercicioField());
        }

        const btnCriarTreino = document.getElementById('btnCriarTreino');
        if (btnCriarTreino) {
            btnCriarTreino.addEventListener('click', () => this.toggleTreinoForm());
        }

        const btnCancelarTreino = document.getElementById('btnCancelarTreino');
        if (btnCancelarTreino) {
            btnCancelarTreino.addEventListener('click', () => this.toggleTreinoForm());
        }

        // Filtros de treino
        const filtroTipo = document.getElementById('filtroTipo');
        if (filtroTipo) {
            filtroTipo.addEventListener('change', () => this.aplicarFiltros());
        }

        const pesquisaTreino = document.getElementById('pesquisaTreino');
        if (pesquisaTreino) {
            pesquisaTreino.addEventListener('input', () => this.aplicarFiltros());
        }

        const btnCriarDesafio = document.getElementById('btnCriarDesafio');
        if (btnCriarDesafio) {
            btnCriarDesafio.addEventListener('click', () => this.toggleDesafioForm());
        }

        const btnCancelarDesafio = document.getElementById('btnCancelarDesafio');
        if (btnCancelarDesafio) {
            btnCancelarDesafio.addEventListener('click', () => this.toggleDesafioForm());
        }

        const btnEditarPerfil = document.getElementById('btnEditarPerfil');
        if (btnEditarPerfil) {
            btnEditarPerfil.addEventListener('click', () => this.editarPerfil());
        }

        // Filtros de desafio
        const filtroStatus = document.getElementById('filtroStatus');
        if (filtroStatus) {
            filtroStatus.addEventListener('change', () => this.aplicarFiltrosDesafios());
        }

        const filtroUnidade = document.getElementById('filtroUnidade');
        if (filtroUnidade) {
            filtroUnidade.addEventListener('change', () => this.aplicarFiltrosDesafios());
        }

        const pesquisaDesafio = document.getElementById('pesquisaDesafio');
        if (pesquisaDesafio) {
            pesquisaDesafio.addEventListener('input', () => this.aplicarFiltrosDesafios());
        }
    }

    // Menu Mobile
    setupMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
    }

    // Navegação entre páginas
    showPage(pageId) {
        // Esconder todas as páginas
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Mostrar página solicitada
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Verificar se precisa de autenticação
        const protectedPages = ['criar-treino', 'meus-desafios', 'perfil'];
        if (protectedPages.includes(pageId) && !this.currentUser) {
            this.showPage('login');
            this.showMessage('Você precisa fazer login para acessar esta página.', 'warning');
            return;
        }

        // Carregar conteúdo específico da página
        switch(pageId) {
            case 'home':
                this.renderHome();
                break;
            case 'criar-treino':
                this.renderTreinos();
                break;
            case 'meus-desafios':
                this.renderDesafios();
                break;
            case 'perfil':
                this.renderPerfil();
                break;
        }

        // Fechar menu mobile se estiver aberto
        document.querySelector('.nav-menu').classList.remove('active');
        document.querySelector('.mobile-menu-toggle').setAttribute('aria-expanded', 'false');
    }

    // Autenticação
    handleLogin(e) {
        e.preventDefault();
        
        try {
            const email = document.getElementById('loginEmail').value.trim();
            const senha = document.getElementById('loginSenha').value.trim();

            console.log('Tentando fazer login com:', { email }); // Log para debug

            // Validações básicas
            if (!email || !senha) {
                this.showMessage('Por favor, preencha todos os campos.', 'error');
                return;
            }

            // Buscar usuários no localStorage
            let usuarios = [];
            try {
                const usuariosString = localStorage.getItem('gymfit_users');
                console.log('Usuários encontrados:', usuariosString); // Log para debug
                usuarios = usuariosString ? JSON.parse(usuariosString) : [];
        } catch (error) {
                console.error('Erro ao ler usuários:', error);
                usuarios = [];
            }

            console.log('Total de usuários:', usuarios.length); // Log para debug

            // Encontrar usuário
            const user = usuarios.find(u => {
                console.log('Comparando com:', u.email); // Log para debug
                return u.email === email && u.senha === senha;
            });

            if (user) {
                console.log('Usuário encontrado:', user.nome); // Log para debug
                
                // Atualizar o estado da aplicação
                this.currentUser = user;
                this.users = usuarios;
                
                // Salvar usuário atual no localStorage
                localStorage.setItem('gymfit_current_user', JSON.stringify(user));
                
                // Atualizar a UI
                this.updateAuthUI();
                this.showPage('home');
                this.showMessage(`Bem-vindo de volta, ${user.nome}!`, 'success');
                
                // Limpar o formulário
                document.getElementById('loginForm').reset();
            } else {
                console.log('Usuário não encontrado'); // Log para debug
                this.showMessage('E-mail ou senha incorretos.', 'error');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            this.showMessage('Erro ao fazer login. Tente novamente.', 'error');
        }
    }

    handleCadastro(e) {
        e.preventDefault();
        
        try {
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value.trim();
            const objetivo = document.getElementById('objetivo').value;

            console.log('Tentando cadastrar:', { email }); // Log para debug

            // Validações básicas
            if (!nome || !email || !senha || !objetivo) {
                this.showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }

            // Buscar usuários existentes
            let usuarios = [];
            try {
                const usuariosString = localStorage.getItem('gymfit_users');
                usuarios = usuariosString ? JSON.parse(usuariosString) : [];
            } catch (error) {
                console.error('Erro ao ler usuários existentes:', error);
                usuarios = [];
            }

            // Verificar se o email já existe
            if (usuarios.some(u => u.email === email)) {
                this.showMessage('Este e-mail já está cadastrado.', 'error');
                return;
            }

            // Criar novo usuário
            const newUser = {
                id: Date.now(),
                nome,
                email,
                senha,
                objetivo,
                dataCadastro: new Date().toISOString(),
                xp: 0
            };

            console.log('Novo usuário criado:', newUser); // Log para debug

            // Adicionar à lista de usuários
            usuarios.push(newUser);
            
            // Salvar no localStorage
            localStorage.setItem('gymfit_users', JSON.stringify(usuarios));
            localStorage.setItem('gymfit_current_user', JSON.stringify(newUser));
            
            console.log('Dados salvos no localStorage'); // Log para debug
            
            // Atualizar o estado da aplicação
            this.users = usuarios;
            this.currentUser = newUser;
            
            // Atualizar a UI
            this.updateAuthUI();
            this.showPage('home');
            this.showMessage(`Conta criada com sucesso! Bem-vindo, ${nome}!`, 'success');
            this.addAtividade('Conta criada', 'Bem-vindo ao GymFit!');
            
            // Limpar o formulário
            document.getElementById('cadastroForm').reset();

        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            this.showMessage('Erro ao criar conta. Tente novamente.', 'error');
        }
    }

    logout() {
        try {
            // Limpar dados do usuário
            this.currentUser = null;
            localStorage.removeItem('gymfit_current_user');
            
            // Atualizar a UI
            this.updateAuthUI();
            this.showPage('home');
            this.showMessage('Logout realizado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            this.showMessage('Erro ao fazer logout. Tente novamente.', 'error');
        }
    }

    checkAuth() {
        try {
            const savedUser = localStorage.getItem('gymfit_current_user');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                this.updateAuthUI();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            return false;
        }
    }

    updateAuthUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('user-name');

        if (this.currentUser) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            userName.textContent = this.currentUser.nome;
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    }

    // Treinos
    handleCriarTreino(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showMessage('Você precisa estar logado para criar um treino.', 'error');
            return;
        }

        const nome = document.getElementById('nomeTreino').value.trim();
        const tipo = document.getElementById('tipoTreino').value;
        
        // Coletar exercícios
        const exercicios = [];
        document.querySelectorAll('.exercicio-item').forEach(field => {
            const nome = field.querySelector('.exercicio-nome').value.trim();
            const series = parseInt(field.querySelector('.exercicio-series').value);
            const repeticoes = parseInt(field.querySelector('.exercicio-repeticoes').value);
            const peso = parseFloat(field.querySelector('.exercicio-peso').value);

            if (nome && series && repeticoes) {
                exercicios.push({ nome, series, repeticoes, peso });
            }
        });

        if (!nome || !tipo) {
            this.showMessage('Por favor, preencha o nome e tipo do treino.', 'warning');
            return;
        }

        if (exercicios.length === 0) {
            this.showMessage('Adicione pelo menos um exercício ao treino.', 'warning');
            return;
        }

        const treino = {
            id: Date.now(),
            userId: this.currentUser.id,
            nome,
            tipo,
            exercicios,
            dataCriacao: new Date().toISOString(),
            ultimaRealizacao: null,
            historico: []
        };

        this.treinos.push(treino);
        this.saveToStorage('gymfit_treinos', this.treinos);
        
        this.showMessage('Treino criado com sucesso!', 'success');
        this.addAtividade('Novo Treino', `Treino "${nome}" criado`);
        this.addXP(50);
        
        this.toggleTreinoForm();
        this.renderTreinos();
    }

    toggleTreinoForm() {
        const form = document.getElementById('form-criar-treino');
        const isVisible = form.style.display !== 'none';
        
        if (isVisible) {
            form.style.display = 'none';
            document.getElementById('treino-form').reset();
            document.querySelector('.exercicios-lista').innerHTML = '';
            this.addExercicioField();
            } else {
            form.style.display = 'block';
        }
    }

    addExercicioField() {
        const exerciciosLista = document.querySelector('.exercicios-lista');
        const exercicioDiv = document.createElement('div');
        exercicioDiv.className = 'exercicio-item card';
        exercicioDiv.innerHTML = `
            <div class="exercicio-header">
                <h4>Exercício ${exerciciosLista.children.length + 1}</h4>
                <button type="button" class="btn-remove-exercicio" onclick="this.closest('.exercicio-item').remove()">×</button>
            </div>
            <div class="exercicio-fields">
                <div class="form-group">
                    <label>Nome do Exercício</label>
                    <input type="text" class="exercicio-nome" placeholder="Ex: Supino reto" required>
                </div>
                <div class="form-group">
                    <label>Séries</label>
                    <input type="number" class="exercicio-series" min="1" value="3" required>
                </div>
                <div class="form-group">
                    <label>Repetições</label>
                    <input type="number" class="exercicio-repeticoes" min="1" value="12" required>
                </div>
                <div class="form-group">
                    <label>Peso (kg)</label>
                    <input type="number" class="exercicio-peso" min="0" step="0.5" value="0" required>
                </div>
            </div>
        `;
        exerciciosLista.appendChild(exercicioDiv);
    }

    renderTreinos() {
        const listaTreinos = document.getElementById('lista-treinos');
        if (!listaTreinos) return;

        const userTreinos = this.treinos.filter(t => t.userId === this.currentUser?.id);
        
        if (userTreinos.length === 0) {
            listaTreinos.innerHTML = '<p class="empty-state">Nenhum treino criado ainda. Crie seu primeiro treino!</p>';
            return;
        }

        listaTreinos.innerHTML = userTreinos.map(treino => `
            <div class="treino-card card">
                <div class="treino-header">
                    <h4>${treino.nome}</h4>
                    <span class="treino-tipo badge">${this.getTipoTreino(treino.tipo)}</span>
                </div>
                <div class="treino-info">
                    <p><strong>${treino.exercicios.length}</strong> exercícios</p>
                    <p class="treino-stats">
                        Última realização: ${treino.ultimaRealizacao ? 
                            new Date(treino.ultimaRealizacao).toLocaleDateString('pt-BR') : 
                            'Nunca realizado'}
                    </p>
                </div>
                <div class="treino-actions">
                    <button class="btn btn-sm btn-primary" onclick="app.visualizarTreino(${treino.id})">
                        <span class="icon">👁️</span> Ver Detalhes
                    </button>
                    <button class="btn btn-sm btn-success" onclick="app.marcarTreinoRealizado(${treino.id})">
                        <span class="icon">✅</span> Marcar Realizado
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.removerTreino(${treino.id})">
                        <span class="icon">🗑️</span> Remover
                    </button>
                </div>
            </div>
        `).join('');
    }

    getTipoTreino(tipo) {
        const tipos = {
            'musculacao': 'Musculação',
            'cardio': 'Cardio',
            'funcional': 'Funcional',
            'hiit': 'HIIT',
            'yoga': 'Yoga',
            'pilates': 'Pilates',
            'crossfit': 'CrossFit'
        };
        return tipos[tipo] || tipo;
    }

    visualizarTreino(treinoId) {
        const treino = this.treinos.find(t => t.id === treinoId);
        if (!treino) return;

        const exerciciosHtml = treino.exercicios.map(ex => `
            <div class="exercicio-detalhe">
                <h5>${ex.nome}</h5>
                <div class="exercicio-info">
                    <span class="badge">${ex.series} séries</span>
                    <span class="badge">${ex.repeticoes} repetições</span>
                    ${ex.peso > 0 ? `<span class="badge">${ex.peso} kg</span>` : ''}
                </div>
            </div>
        `).join('');

        const historicoHtml = treino.historico && treino.historico.length > 0 ? `
            <div class="historico-treinos">
                <h4>Histórico de Realizações</h4>
                <ul>
                    ${treino.historico.slice(-5).map(h => `
                        <li>${new Date(h.data).toLocaleDateString('pt-BR')} - ${h.observacao || 'Sem observações'}</li>
                    `).join('')}
                </ul>
            </div>
        ` : '';

        this.showModal(`
            <div class="treino-detalhes">
                <div class="treino-header">
                    <h3>${treino.nome}</h3>
                    <span class="badge">${this.getTipoTreino(treino.tipo)}</span>
                </div>
                <div class="exercicios-lista">
                    <h4>Exercícios</h4>
                    ${exerciciosHtml}
                </div>
                ${historicoHtml}
                <div class="timer-display">
                    <div class="time">00:00</div>
                    <div class="time-label">Tempo de Descanso</div>
                    <div class="timer-buttons">
                        <button class="timer-btn" onclick="app.iniciarTimer(30)">30s</button>
                        <button class="timer-btn" onclick="app.iniciarTimer(60)">60s</button>
                        <button class="timer-btn" onclick="app.iniciarTimer(90)">90s</button>
                        <button class="timer-btn stop" onclick="app.pararTimer()" style="display: none;">Parar</button>
                    </div>
                </div>
            </div>
        `);
    }

    marcarTreinoRealizado(treinoId) {
        const treino = this.treinos.find(t => t.id === treinoId);
        if (!treino) return;

        const observacao = prompt('Alguma observação sobre o treino? (opcional)');
        const data = new Date().toISOString();

        // Atualizar última realização
        treino.ultimaRealizacao = data;

        // Adicionar ao histórico
        if (!treino.historico) treino.historico = [];
        treino.historico.push({ data, observacao });

        this.saveToStorage('gymfit_treinos', this.treinos);
        
        this.showMessage('Treino marcado como realizado!', 'success');
        this.addXP(75);
        this.addAtividade('Treino Realizado', `Treino "${treino.nome}" concluído`);
        
        this.renderTreinos();
    }

    removerTreino(treinoId) {
        if (confirm('Tem certeza que deseja remover este treino?')) {
            this.treinos = this.treinos.filter(t => t.id !== treinoId);
            this.saveToStorage('gymfit_treinos', this.treinos);
            this.renderTreinos();
            this.showMessage('Treino removido com sucesso!', 'success');
        }
    }

    // Desafios
    handleCriarDesafio(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showMessage('Você precisa estar logado para criar um desafio.', 'error');
        return;
    }

        const titulo = document.getElementById('tituloDesafio').value;
        const descricao = document.getElementById('descricaoDesafio').value;
        const meta = parseInt(document.getElementById('metaDesafio').value);
        const unidade = document.getElementById('unidadeDesafio').value;

        const desafio = {
                id: Date.now(),
            userId: this.currentUser.id,
            titulo,
            descricao,
            meta,
            unidade,
        progresso: 0,
        dataCriacao: new Date().toISOString(),
        concluido: false
    };

        this.desafios.push(desafio);
        this.saveToStorage('gymfit_desafios', this.desafios);
        
        this.showMessage('Desafio criado com sucesso!', 'success');
        this.addAtividade('Novo Desafio', `Desafio "${titulo}" criado`);
        this.addXP(30);
        
        document.getElementById('desafio-form').reset();
        this.toggleDesafioForm();
        this.renderDesafios();
    }

    toggleDesafioForm() {
        const form = document.getElementById('form-criar-desafio');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }

    renderDesafios() {
        const userDesafios = this.desafios.filter(d => d.userId === this.currentUser?.id);
        const ativos = userDesafios.filter(d => !d.concluido);
        const concluidos = userDesafios.filter(d => d.concluido);

        // Renderizar desafios ativos
        const listaAtivos = document.getElementById('lista-desafios-ativos');
        if (ativos.length === 0) {
            listaAtivos.innerHTML = '<p class="empty-state">Nenhum desafio ativo.</p>';
        } else {
            listaAtivos.innerHTML = ativos.map(desafio => this.renderDesafioCard(desafio)).join('');
        }

        // Renderizar desafios concluídos
        const listaConcluidos = document.getElementById('lista-desafios-concluidos');
        if (concluidos.length === 0) {
            listaConcluidos.innerHTML = '<p class="empty-state">Nenhum desafio concluído ainda.</p>';
        } else {
            listaConcluidos.innerHTML = concluidos.map(desafio => this.renderDesafioCard(desafio)).join('');
        }
    }

    renderDesafioCard(desafio) {
        const progressoPercent = Math.min((desafio.progresso / desafio.meta) * 100, 100);
        const isCompleto = desafio.concluido;

        return `
            <div class="desafio-card card">
                <div class="desafio-header">
                <h4>${desafio.titulo}</h4>
                    ${isCompleto ? '<span class="badge badge-success">Concluído</span>' : ''}
                </div>
                <p>${desafio.descricao}</p>
                <div class="progresso-info">
                    <div class="progresso-bar-container">
                        <div class="progresso-bar" style="width: ${progressoPercent}%"></div>
                </div>
                    <p>Progresso: ${desafio.progresso}/${desafio.meta} ${desafio.unidade} (${progressoPercent.toFixed(1)}%)</p>
            </div>
                <div class="desafio-actions">
                    ${!isCompleto ? `
                        <button class="btn btn-sm btn-primary" onclick="app.adicionarProgressoDesafio(${desafio.id})">+ Progresso</button>
                        <button class="btn btn-sm btn-secondary" onclick="app.editarDesafio(${desafio.id})">Editar</button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" onclick="app.removerDesafio(${desafio.id})">Remover</button>
                </div>
            </div>
        `;
    }

    adicionarProgressoDesafio(desafioId, quantidade = 1) {
        const desafio = this.desafios.find(d => d.id === desafioId);
        if (!desafio) return;

        desafio.progresso = Math.min(desafio.meta, desafio.progresso + quantidade);
        
        if (desafio.progresso >= desafio.meta && !desafio.concluido) {
            desafio.concluido = true;
            this.showMessage('Parabéns! Você completou o desafio!', 'success');
            this.addXP(100);
            this.addAtividade('Desafio Concluído', `Desafio "${desafio.titulo}" completado!`);
        }

        this.saveToStorage('gymfit_desafios', this.desafios);
        this.renderDesafios();
    }

    editarDesafio(desafioId) {
        const desafio = this.desafios.find(d => d.id === desafioId);
        if (!desafio) return;

        const novoTitulo = prompt('Novo título:', desafio.titulo);
        if (novoTitulo) {
            desafio.titulo = novoTitulo;
            this.saveToStorage('gymfit_desafios', this.desafios);
            this.renderDesafios();
            this.showMessage('Desafio atualizado!', 'success');
        }
    }

    removerDesafio(desafioId) {
        if (confirm('Tem certeza que deseja remover este desafio?')) {
            this.desafios = this.desafios.filter(d => d.id !== desafioId);
            this.saveToStorage('gymfit_desafios', this.desafios);
            this.renderDesafios();
            this.showMessage('Desafio removido!', 'success');
        }
    }

    // Perfil
    renderPerfil() {
        if (!this.currentUser) return;

        const user = this.currentUser;
        
        // Informações pessoais
        document.getElementById('perfil-nome').textContent = user.nome;
        document.getElementById('perfil-email').textContent = user.email;
        document.getElementById('perfil-objetivo').textContent = this.getObjetivoText(user.objetivo);
        document.getElementById('perfil-data-cadastro').textContent = new Date(user.dataCadastro).toLocaleDateString('pt-BR');

        // Renderizar estatísticas
        this.renderStats();

        // Últimas atividades
        this.renderAtividades();
    }

    renderStats() {
        if (!this.currentUser) return;

        const userTreinos = this.treinos.filter(t => t.userId === this.currentUser.id);
        const userDesafios = this.desafios.filter(d => d.userId === this.currentUser.id);
        const desafiosCompletos = userDesafios.filter(d => d.concluido);
        const treinosRealizados = userTreinos.reduce((total, treino) => 
            total + (treino.historico ? treino.historico.length : 0), 0);

        // Atualizar os números nas estatísticas
        document.querySelector('[data-stat="desafios-completados"]').textContent = desafiosCompletos.length;
        document.querySelector('[data-stat="treinos-criados"]').textContent = userTreinos.length;
        document.querySelector('[data-stat="desafios-ativos"]').textContent = userDesafios.filter(d => !d.concluido).length;
        document.querySelector('[data-stat="pontos-experiencia"]').textContent = this.currentUser.xp || 0;
    }

    renderAtividades() {
        const container = document.getElementById('ultimas-atividades');
        const userAtividades = this.atividades
            .filter(a => a.userId === this.currentUser?.id)
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 5);

        if (userAtividades.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma atividade registrada ainda.</p>';
        return;
    }

        container.innerHTML = userAtividades.map(atividade => `
            <div class="atividade-item">
                <div class="atividade-icon">📅</div>
                <div class="atividade-content">
                    <h5>${atividade.titulo}</h5>
                    <p>${atividade.descricao}</p>
                    <small>${new Date(atividade.data).toLocaleDateString('pt-BR')}</small>
                </div>
            </div>
        `).join('');
    }

    editarPerfil() {
        const novoNome = prompt('Novo nome:', this.currentUser.nome);
        if (novoNome && novoNome !== this.currentUser.nome) {
            this.currentUser.nome = novoNome;
            
            // Atualizar no array de usuários
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex] = this.currentUser;
                this.saveToStorage('gymfit_users', this.users);
                this.saveToStorage('gymfit_current_user', this.currentUser);
            }
            
            this.renderPerfil();
            this.updateAuthUI();
            this.showMessage('Perfil atualizado com sucesso!', 'success');
        }
    }

    // Utilidades
    addXP(amount) {
        if (this.currentUser) {
            this.currentUser.xp = (this.currentUser.xp || 0) + amount;
            
            // Atualizar no array de usuários
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex] = this.currentUser;
                this.saveToStorage('gymfit_users', this.users);
                this.saveToStorage('gymfit_current_user', this.currentUser);
            }
        }
    }

    addAtividade(titulo, descricao) {
        if (this.currentUser) {
            const novaAtividade = {
        id: Date.now(),
                userId: this.currentUser.id,
                titulo,
                descricao,
                data: new Date().toISOString()
            };
            
            this.atividades.push(novaAtividade);
            this.saveToStorage('gymfit_atividades', this.atividades);
        }
    }

    getObjetivoText(objetivo) {
        const objetivos = {
            'emagrecimento': 'Emagrecimento',
            'hipertrofia': 'Ganho de Massa Muscular',
            'resistencia': 'Resistência',
            'saude': 'Saúde e Bem-estar'
        };
        return objetivos[objetivo] || objetivo;
    }

    // Tema
    loadTheme() {
        console.log('Carregando tema...'); // Debug
        const savedTheme = localStorage.getItem('gymfit_theme') || 'claro';
        console.log('Tema salvo:', savedTheme); // Debug
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = savedTheme === 'escuro';
            themeToggle.addEventListener('change', (e) => {
                const theme = e.target.checked ? 'escuro' : 'claro';
                console.log('Mudando tema para:', theme); // Debug
                this.applyTheme(theme);
                localStorage.setItem('gymfit_theme', theme);
            });
        }

        this.applyTheme(savedTheme);
    }

    applyTheme(theme) {
        console.log('Aplicando tema:', theme); // Debug
        document.body.setAttribute('data-theme', theme);
        // Atualizar meta theme-color para mobile
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'escuro' ? '#1a1a1a' : '#ffffff');
        }
    }

    // Home
    renderHome() {
        // Renderizar desafios em destaque
        const desafiosDestaque = this.desafios
            .filter(d => !d.concluido)
            .sort((a, b) => b.progresso - a.progresso)
            .slice(0, 3);

        const desafiosGrid = document.querySelector('.desafios-grid');
        if (desafiosDestaque.length === 0) {
            desafiosGrid.innerHTML = '<p class="empty-state">Nenhum desafio ativo no momento.</p>';
        } else {
            desafiosGrid.innerHTML = desafiosDestaque.map(desafio => {
                const progressoPercent = Math.min((desafio.progresso / desafio.meta) * 100, 100);
                return `
                    <div class="desafio-card card">
                        <h4 class="card-title">${desafio.titulo}</h4>
                        <p>${desafio.descricao}</p>
                        <div class="progresso-bar-container">
                            <div class="progresso-bar" style="width: ${progressoPercent}%;"></div>
                        </div>
                        <p>Progresso: ${progressoPercent.toFixed(1)}%</p>
                        <button class="btn btn-sm btn-primary" onclick="app.showPage('meus-desafios')">Ver Detalhes</button>
                    </div>
                `;
            }).join('');
        }
    }

    // Mensagens e Modal
    showMessage(message, type = 'info') {
        // Verifica se já existe um container de notificações, se não, cria um
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Cria a notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Adiciona o conteúdo da notificação
        notification.innerHTML = `
            <div class="notification-icon">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '!' : 'ℹ'}
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        `;

        // Adiciona ao container
        container.appendChild(notification);

        // Configura o botão de fechar
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        });

        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    showModal(content) {
        // Criar overlay do modal
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Fechar</button>
                </div>
            </div>
        `;

        // Adicionar ao body
        document.body.appendChild(modalOverlay);

        // Fechar modal ao clicar no overlay
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });
    }

    // Relatórios e Estatísticas
    gerarRelatorio() {
        if (!this.currentUser) return;

        const userTreinos = this.treinos.filter(t => t.userId === this.currentUser.id);
        const userDesafios = this.desafios.filter(d => d.userId === this.currentUser.id);
        const desafiosCompletos = userDesafios.filter(d => d.concluido);
        
        const totalTreinosRealizados = userTreinos.reduce((total, treino) => total + (treino.ultimaRealizacao ? 1 : 0), 0);
        
        const relatorio = `
            <h3>📊 Relatório de Atividades</h3>
            <div class="relatorio-stats">
                <div class="stat-item">
                    <h4>${userTreinos.length}</h4>
                    <p>Treinos Criados</p>
                </div>
                <div class="stat-item">
                    <h4>${totalTreinosRealizados}</h4>
                    <p>Treinos Realizados</p>
                </div>
                <div class="stat-item">
                    <h4>${desafiosCompletos.length}</h4>
                    <p>Desafios Completos</p>
                </div>
                <div class="stat-item">
                    <h4>${this.currentUser.xp || 0}</h4>
                    <p>XP Total</p>
                </div>
            </div>
            <div class="relatorio-detalhes">
                <h4>🏆 Conquistas Recentes</h4>
                ${desafiosCompletos.length > 0 ? 
                    desafiosCompletos.slice(-3).map(d => `
                        <div class="conquista-item">
                            <span>✅ ${d.titulo}</span>
                            <small>Concluído em ${new Date(d.dataCriacao).toLocaleDateString('pt-BR')}</small>
                        </div>
                    `).join('') : 
                    '<p>Nenhuma conquista ainda. Continue se exercitando!</p>'
                }
            </div>
        `;

        this.showModal(relatorio);
    }

    // Backup e Restauração
    exportarDados() {
        if (!this.currentUser) {
            this.showMessage('Você precisa estar logado para exportar dados.', 'warning');
            return;
        }

        const userData = {
            usuario: this.currentUser,
            treinos: this.treinos.filter(t => t.userId === this.currentUser.id),
            desafios: this.desafios.filter(d => d.userId === this.currentUser.id),
            atividades: this.atividades.filter(a => a.userId === this.currentUser.id),
            dataExportacao: new Date().toISOString()
        };

        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `gymfit_backup_${this.currentUser.nome}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showMessage('Dados exportados com sucesso!', 'success');
    }

    importarDados(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const userData = JSON.parse(e.target.result);
                
                // Validar estrutura dos dados
                if (!userData.usuario || !userData.treinos || !userData.desafios) {
                    throw new Error('Arquivo de backup inválido');
                }

                // Confirmar importação
                if (confirm('Deseja importar os dados? Isso substituirá seus dados atuais.')) {
                    // Atualizar dados do usuário
                    const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex !== -1) {
                        this.users[userIndex] = userData.usuario;
                        this.currentUser = userData.usuario;
                    }

                    // Remover dados antigos do usuário
                    this.treinos = this.treinos.filter(t => t.userId !== this.currentUser.id);
                    this.desafios = this.desafios.filter(d => d.userId !== this.currentUser.id);
                    this.atividades = this.atividades.filter(a => a.userId !== this.currentUser.id);

                    // Adicionar dados importados
                    this.treinos.push(...userData.treinos);
                    this.desafios.push(...userData.desafios);
                    this.atividades.push(...userData.atividades);

                    // Salvar no localStorage
                    this.saveToStorage('gymfit_users', this.users);
                    this.saveToStorage('gymfit_current_user', this.currentUser);
                    this.saveToStorage('gymfit_treinos', this.treinos);
                    this.saveToStorage('gymfit_desafios', this.desafios);
                    this.saveToStorage('gymfit_atividades', this.atividades);

                    this.showMessage('Dados importados com sucesso!', 'success');
                    this.renderPerfil();
                }
            } catch (error) {
                this.showMessage('Erro ao importar dados: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    // Pesquisa e Filtros
    pesquisarTreinos(termo) {
        const userTreinos = this.treinos.filter(t => t.userId === this.currentUser?.id);
        const resultados = userTreinos.filter(treino => 
            treino.nome.toLowerCase().includes(termo.toLowerCase()) ||
            treino.tipo.toLowerCase().includes(termo.toLowerCase()) ||
            treino.exercicios.some(ex => ex.nome.toLowerCase().includes(termo.toLowerCase()))
        );
        
        return resultados;
    }

    filtrarTreinosPorTipo(tipo) {
        const userTreinos = this.treinos.filter(t => t.userId === this.currentUser?.id);
        if (tipo === 'todos') return userTreinos;
        return userTreinos.filter(treino => treino.tipo === tipo);
    }

    // Gamificação
    calcularNivel() {
        if (!this.currentUser) return 1;
        const xp = this.currentUser.xp || 0;
        return Math.floor(xp / 100) + 1;
    }

    getXPParaProximoNivel() {
        const nivel = this.calcularNivel();
        const xpNecessario = nivel * 100;
        const xpAtual = this.currentUser?.xp || 0;
        return xpNecessario - (xpAtual % 100);
    }

    getBadges() {
        if (!this.currentUser) return [];
        
        const badges = [];
        const userTreinos = this.treinos.filter(t => t.userId === this.currentUser.id);
        const userDesafios = this.desafios.filter(d => d.userId === this.currentUser.id);
        const desafiosCompletos = userDesafios.filter(d => d.concluido);
        const totalTreinosRealizados = userTreinos.reduce((total, treino) => total + (treino.ultimaRealizacao ? 1 : 0), 0);

        // Badge de primeiro treino
        if (userTreinos.length >= 1) {
            badges.push({ nome: 'Primeiro Passo', descricao: 'Criou seu primeiro treino', icon: '🏃‍♂️' });
        }

        // Badge de primeiro desafio
        if (desafiosCompletos.length >= 1) {
            badges.push({ nome: 'Desafiador', descricao: 'Completou seu primeiro desafio', icon: '🏆' });
        }

        // Badge de consistência
        if (totalTreinosRealizados >= 10) {
            badges.push({ nome: 'Consistente', descricao: 'Realizou 10 treinos', icon: '💪' });
        }

        // Badge de veterano
        if (totalTreinosRealizados >= 50) {
            badges.push({ nome: 'Veterano', descricao: 'Realizou 50 treinos', icon: '🔥' });
        }

        // Badge de mestre
        if (desafiosCompletos.length >= 5) {
            badges.push({ nome: 'Mestre dos Desafios', descricao: 'Completou 5 desafios', icon: '👑' });
        }

        return badges;
    }

    // Timer
    iniciarTimer(segundos) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        const timeDisplay = document.querySelector('.time');
        const btnStop = document.querySelector('.timer-btn.stop');
        const btnsStart = document.querySelectorAll('.timer-btn:not(.stop)');
        
        // Mostrar botão de parar e esconder botões de início
        btnStop.style.display = 'block';
        btnsStart.forEach(btn => btn.disabled = true);

        let tempoRestante = segundos;
        this.atualizarDisplayTimer(tempoRestante);

        this.timerInterval = setInterval(() => {
            tempoRestante--;
            this.atualizarDisplayTimer(tempoRestante);

            if (tempoRestante <= 0) {
                this.pararTimer();
                this.showMessage('Tempo de descanso finalizado!', 'success');
                // Tocar som de notificação
                const audio = new Audio('data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
                audio.play();
            }
        }, 1000);
    }

    pararTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        const btnStop = document.querySelector('.timer-btn.stop');
        const btnsStart = document.querySelectorAll('.timer-btn:not(.stop)');
        
        // Esconder botão de parar e habilitar botões de início
        btnStop.style.display = 'none';
        btnsStart.forEach(btn => btn.disabled = false);

        this.atualizarDisplayTimer(0);
    }

    atualizarDisplayTimer(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segsRestantes = segundos % 60;
        const timeDisplay = document.querySelector('.time');
        if (timeDisplay) {
            timeDisplay.textContent = `${String(minutos).padStart(2, '0')}:${String(segsRestantes).padStart(2, '0')}`;
        }
    }

    // Inicialização final
    setupAdvancedFeatures() {
        // Solicitar permissão para notificações ao carregar
        this.requestNotificationPermission();

        // Adicionar event listeners para recursos avançados
        document.addEventListener('keydown', (e) => {
            // Atalhos de teclado
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.exportarDados();
                        break;
                    case 'n':
                        e.preventDefault();
                        if (this.currentUser) {
                            this.showPage('criar-treino');
                        }
                        break;
                }
            }
        });

        // Auto-save a cada 30 segundos
        setInterval(() => {
            if (this.currentUser) {
                this.saveToStorage('gymfit_current_user', this.currentUser);
            }
        }, 30000);
    }

    // Método para atualizar a UI após mudanças
    updateUI() {
        this.renderHome();
        this.updateAuthUI();
        if (this.currentUser) {
            this.renderTreinos();
            this.renderDesafios();
            this.renderPerfil();
        }
    }

    aplicarFiltros() {
        const tipo = document.getElementById('filtroTipo').value;
        const termo = document.getElementById('pesquisaTreino').value.toLowerCase();
        
        let treinos = this.treinos.filter(t => t.userId === this.currentUser?.id);
        
        // Filtrar por tipo
        if (tipo !== 'todos') {
            treinos = treinos.filter(t => t.tipo === tipo);
        }
        
        // Filtrar por termo de pesquisa
        if (termo) {
            treinos = treinos.filter(t => 
                t.nome.toLowerCase().includes(termo) ||
                t.tipo.toLowerCase().includes(termo) ||
                t.exercicios.some(ex => ex.nome.toLowerCase().includes(termo))
            );
        }
        
        // Renderizar resultados filtrados
        const listaTreinos = document.getElementById('lista-treinos');
        if (treinos.length === 0) {
            listaTreinos.innerHTML = '<p class="empty-state">Nenhum treino encontrado com os filtros aplicados.</p>';
            return;
        }
        
        listaTreinos.innerHTML = treinos.map(treino => `
            <div class="treino-card card">
                <div class="treino-header">
                    <h4>${treino.nome}</h4>
                    <span class="treino-tipo badge">${this.getTipoTreino(treino.tipo)}</span>
                </div>
                <div class="treino-info">
                    <p><strong>${treino.exercicios.length}</strong> exercícios</p>
                    <p class="treino-stats">
                        Última realização: ${treino.ultimaRealizacao ? 
                            new Date(treino.ultimaRealizacao).toLocaleDateString('pt-BR') : 
                            'Nunca realizado'}
                    </p>
                </div>
                <div class="treino-actions">
                    <button class="btn btn-sm btn-primary" onclick="app.visualizarTreino(${treino.id})">
                        <span class="icon">👁️</span> Ver Detalhes
                    </button>
                    <button class="btn btn-sm btn-success" onclick="app.marcarTreinoRealizado(${treino.id})">
                        <span class="icon">✅</span> Marcar Realizado
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.removerTreino(${treino.id})">
                        <span class="icon">🗑️</span> Remover
                    </button>
                </div>
            </div>
        `).join('');
    }

    aplicarFiltrosDesafios() {
        const status = document.getElementById('filtroStatus').value;
        const unidade = document.getElementById('filtroUnidade').value;
        const termo = document.getElementById('pesquisaDesafio').value.toLowerCase();
        
        let desafios = this.desafios.filter(d => d.userId === this.currentUser?.id);
        
        // Filtrar por status
        if (status !== 'todos') {
            switch (status) {
                case 'ativos':
                    desafios = desafios.filter(d => !d.concluido);
                    break;
                case 'concluidos':
                    desafios = desafios.filter(d => d.concluido);
                    break;
                case 'pendentes':
                    desafios = desafios.filter(d => !d.concluido && d.progresso === 0);
                    break;
            }
        }
        
        // Filtrar por unidade
        if (unidade !== 'todos') {
            desafios = desafios.filter(d => d.unidade === unidade);
        }
        
        // Filtrar por termo de pesquisa
        if (termo) {
            desafios = desafios.filter(d => 
                d.titulo.toLowerCase().includes(termo) ||
                d.descricao.toLowerCase().includes(termo)
            );
        }
        
        // Renderizar resultados filtrados
        const listaDesafios = document.getElementById('lista-desafios-ativos');
        if (desafios.length === 0) {
            listaDesafios.innerHTML = '<p class="empty-state">Nenhum desafio encontrado com os filtros aplicados.</p>';
            return;
        }
        
        listaDesafios.innerHTML = desafios.map(desafio => this.renderDesafioCard(desafio)).join('');
    }

    // Solicitar permissão para notificações
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Inicialização da aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, iniciando aplicação...');
    app = new GymFitApp();
    app.setupAdvancedFeatures();
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registrado'))
            .catch(error => console.log('SW falhou'));
    });
}

// Gerenciamento de Tema
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Função para definir o tema
function setTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.checked = isDark;
}

// Inicializar tema
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme === 'dark');
    } else {
        setTheme(prefersDarkScheme.matches);
    }
}

// Evento de mudança do toggle
themeToggle.addEventListener('change', (e) => {
    setTheme(e.target.checked);
});

// Evento de mudança da preferência do sistema
prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches);
    }
});

// Inicializar tema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeTheme); 