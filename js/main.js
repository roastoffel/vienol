// Função para carregar componentes reutilizáveis (header, footer)
async function loadComponent(selector, url) {
  const element = document.querySelector(selector);
  if (element) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const content = await response.text();
        element.innerHTML = content;
        // Re-inicializa os Feather Icons após carregar o novo conteúdo
        if (typeof feather !== "undefined") {
          feather.replace();
        }
      } else {
        console.error(
          `Error loading component from ${url}: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error(`Network error when trying to fetch ${url}:`, error);
    }
  }
}

// Espera que todo o conteúdo da página seja carregado antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
  // Carrega o header e o footer
  // loadComponent("header", "/header.html");
  if (!document.body.matches("#home-page")) {
    loadComponent("footer", "/footer.html");
  }

  // --- Inicialização dos Ícones Feather ---
  feather.replace();

  // --- Lógica do Menu Móvel (Principal) ---
  document.body.addEventListener("click", (event) => {
    const mobileMenuButton = event.target.closest("#mobile-menu-button");
    if (mobileMenuButton) {
      const mobileMenu = document.getElementById("mobile-menu");
      const menuOverlay = document.getElementById("menu-overlay");
      const mobileMenuIcon = mobileMenuButton.querySelector("i");

      if (mobileMenu && menuOverlay) {
        mobileMenu.classList.toggle("translate-x-full");
        menuOverlay.classList.toggle("hidden");
        if (mobileMenu.classList.contains("translate-x-full")) {
          mobileMenuIcon.setAttribute("data-feather", "menu");
        } else {
          mobileMenuIcon.setAttribute("data-feather", "x");
        }
        feather.replace();
      }
    }

    if (event.target.id === "menu-overlay") {
      const mobileMenu = document.getElementById("mobile-menu");
      const mobileMenuButton = document.getElementById("mobile-menu-button");
      event.target.classList.add("hidden");
      mobileMenu.classList.add("translate-x-full");
      if (mobileMenuButton) {
        const mobileMenuIcon = mobileMenuButton.querySelector("i");
        mobileMenuIcon.setAttribute("data-feather", "menu");
        feather.replace();
      }
    }
  });

  // --- LÓGICA PARA SUBMENUS NO MOBILE ---
  document.body.addEventListener("click", function (event) {
    const button = event.target.closest(".mobile-submenu-button");
    if (button) {
      event.stopPropagation();
      const submenu = button.nextElementSibling;
      const icon = button.querySelector("i");
      if (submenu) {
        submenu.classList.toggle("hidden");
        if (submenu.classList.contains("hidden")) {
          icon.style.transform = "rotate(0deg)";
        } else {
          icon.style.transform = "rotate(180deg)";
        }
      }
    }
  });

  // --- Controlo de Volume do Vídeo (index.html) ---
  const bgVideo = document.getElementById("bgVideo");
  const volumeButton = document.getElementById("volume-button");
  if (bgVideo && volumeButton) {
    const volumeIcon = document.getElementById("volume-icon");
    bgVideo.muted = true;
    volumeIcon.setAttribute("data-feather", "volume-x");
    feather.replace();
    volumeButton.addEventListener("click", () => {
      bgVideo.muted = !bgVideo.muted;
      if (bgVideo.muted) {
        volumeIcon.setAttribute("data-feather", "volume-x");
      } else {
        volumeIcon.setAttribute("data-feather", "volume-2");
      }
      feather.replace();
    });
  }

  // --- Controles de Vídeo (empresa.html) ---
  const historyVideo = document.getElementById("historyVideo");
  const playPauseButton = document.getElementById("play-pause-button");
  const playPauseIconWrapper = document.getElementById(
    "play-pause-icon-wrapper"
  );
  const historyVolumeButton = document.getElementById("history-volume-button");
  const historyVolumeIconWrapper = document.getElementById(
    "history-volume-icon-wrapper"
  );
  if (
    historyVideo &&
    playPauseButton &&
    playPauseIconWrapper &&
    historyVolumeButton &&
    historyVolumeIconWrapper
  ) {
    playPauseButton.addEventListener("click", () => {
      if (historyVideo.paused) {
        historyVideo.play();
        playPauseIconWrapper.innerHTML =
          '<i data-feather="pause" class="w-20 h-20"></i>';
      } else {
        historyVideo.pause();
        playPauseIconWrapper.innerHTML =
          '<i data-feather="play" class="w-20 h-20"></i>';
      }
      feather.replace();
    });

    historyVolumeButton.addEventListener("click", () => {
      historyVideo.muted = !historyVideo.muted;
      if (historyVideo.muted) {
        historyVolumeIconWrapper.innerHTML =
          '<i data-feather="volume-x" class="w-6 h-6"></i>';
      } else {
        historyVolumeIconWrapper.innerHTML =
          '<i data-feather="volume-2" class="w-6 h-6"></i>';
      }
      feather.replace();
    });
  }

  // ======================================================
  // --- INÍCIO DA LÓGICA DO CHAT WIDGET ---
  // ======================================================

  const chatWidget = document.getElementById("chat-widget");
  const chatContainer = document.getElementById("chat-container");
  const closeChat = document.getElementById("close-chat");
  const chatInput = document.getElementById("chat-input");
  const sendMessageBtn = document.getElementById("send-message");
  const chatMessages = document.getElementById("chat-messages");

  if (
    chatWidget &&
    chatContainer &&
    closeChat &&
    chatInput &&
    sendMessageBtn &&
    chatMessages
  ) {
    const n8nWebhookUrl =
      "https://easy.n8n.sampotpane.pt/webhook/8abce6d8-cb09-456c-82d2-a6f13456ab86";

    // Adiciona uma mensagem ao ecrã e opcionalmente guarda no histórico
    function addMessage(text, sender, save = true) {
      const messageDiv = document.createElement("div");
      messageDiv.className = `flex mb-4 ${
        sender === "user" ? "justify-end" : "justify-start"
      }`;
      const bubble = document.createElement("div");
      bubble.className = `rounded-lg p-3 max-w-xs text-sm ${
        sender === "user"
          ? "bg-vienol-green text-white"
          : "bg-gray-100 text-black"
      }`;
      bubble.innerHTML = text;
      messageDiv.appendChild(bubble);
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      if (save) {
        const history =
          JSON.parse(sessionStorage.getItem("vienolChatHistory")) || [];
        history.push({ text, sender });
        sessionStorage.setItem("vienolChatHistory", JSON.stringify(history));
      }
    }

    // Carrega o histórico de chat do sessionStorage ao iniciar
    function loadChatHistory() {
      const history = JSON.parse(sessionStorage.getItem("vienolChatHistory"));
      if (history && history.length > 0) {
        chatMessages.innerHTML = ""; // Limpa a mensagem de boas-vindas padrão
        history.forEach((msg) => addMessage(msg.text, msg.sender, false)); // 'false' para não salvar novamente
      }
    }

    // Função para obter ou criar o ID da sessão
    function getOrCreateSessionId() {
      let sessionId = localStorage.getItem("vienolChatSessionId");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("vienolChatSessionId", sessionId);
      }
      return sessionId;
    }

    // Função para enviar mensagem
    async function handleSendMessage() {
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;

      addMessage(userMessage, "user");
      chatInput.value = "";
      chatInput.disabled = true;
      const sessionId = getOrCreateSessionId();
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, sessionId: sessionId }),
        });
        const data = await response.json();
        if (data && data.reply) {
          addMessage(data.reply, "bot");
        } else {
          addMessage("Desculpe, não recebi uma resposta válida.", "bot");
        }
      } catch (error) {
        console.error("Erro ao comunicar com o n8n:", error);
        addMessage(
          "Não foi possível conectar ao assistente. Tente novamente.",
          "bot"
        );
      } finally {
        chatInput.disabled = false;
        chatInput.focus();
      }
    }

    // Event Listeners
    chatWidget.addEventListener("click", () =>
      chatContainer.classList.toggle("hidden")
    );
    closeChat.addEventListener("click", () =>
      chatContainer.classList.add("hidden")
    );
    sendMessageBtn.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSendMessage();
    });

    // Carregar o histórico do chat assim que a página é carregada
    loadChatHistory();
  }
});
