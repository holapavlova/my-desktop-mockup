document.addEventListener("DOMContentLoaded", () => {
    
    // 1. REGISTRAR PLUGINS Y VARIABLES GLOBALES
    gsap.registerPlugin(ScrollTrigger, Draggable);
    let topZIndex = 100;

    const bootScreen = document.getElementById("boot-screen");
    const terminalContent = document.getElementById("terminal-content");
    const windows = document.querySelectorAll(".window");
    const dockIcons = document.querySelectorAll(".dock-icon");
    const projectCards = document.querySelectorAll(".project-card");

    // Elementos ocultos para la animación de entrada
    gsap.set(".top-bar", { y: -50, autoAlpha: 0 });
    gsap.set(".dock-container", { y: 100, autoAlpha: 0 });
    gsap.set(".desktop-icon", { scale: 0, autoAlpha: 0 });
    gsap.set(".window", { scale: 0, autoAlpha: 0 }); 

    // --- 2. SISTEMA DE ARRANQUE (BOOT SEQUENCE) ---
    const bootLines = [
        "Initializing PortfoliOS v1.0...",
        "Loading cosas ininteligibles...",
        "> C3P0: OK",
        "> RAMEN: OK",
        "> BEAUTY: OK",
        "Mounting /user/paula-diaz/portfolio...",
        "Loading assets: [####################] 100%",
        "Starting GUI interface...",
        "Welcome, hola!"
    ];
    
    let lineIndex = 0;

    function typeLine() {
        if (lineIndex < bootLines.length) {
            const newLine = document.createElement("div");
            newLine.textContent = bootLines[lineIndex];
            terminalContent.insertBefore(newLine, terminalContent.lastElementChild);
            lineIndex++;
            window.scrollTo(0, document.body.scrollHeight);
            setTimeout(typeLine, Math.random() * 200 + 50);
        } else {
            setTimeout(revealDesktop, 500);
        }
    }

    function revealDesktop() {
        const tl = gsap.timeline();
        tl.to(bootScreen, { duration: 0.5, autoAlpha: 0, ease: "power2.inOut", onComplete: () => bootScreen.style.display = "none" })
          .to(".top-bar", { duration: 0.8, y: 0, autoAlpha: 1, ease: "expo.out" })
          .to(".dock-container", { duration: 0.8, y: 0, autoAlpha: 1, ease: "back.out(1.7)" }, "-=0.6")
          .to(".desktop-icon", { duration: 0.5, scale: 1, autoAlpha: 1, stagger: 0.1, ease: "back.out(2)" }, "-=0.4")
          .add(() => window.openWindow('about'), "+=0.2");
    }

    // Iniciar arranque
    setTimeout(typeLine, 500);

    // --- 3. VENTANAS ---
    
    // Abrir ventanas
    window.openWindow = function(id) {
        const win = document.getElementById("window-" + id);
        if (win) {
            bringToFront(win);
            gsap.to(win, { duration: 0.3, autoAlpha: 1, scale: 1, x: 0, y: 0, ease: "back.out(1.2)" });
        }
    };

    function closeWindow(win) {
        gsap.to(win, { duration: 0.2, autoAlpha: 0, scale: 0.9 });
    }

    function bringToFront(el) {
        topZIndex++;
        el.style.zIndex = topZIndex;
    }

    // Draggable para Iconos
    Draggable.create(".desktop-icon", {
        bounds: "#desktop-area",
        type: "x,y",
        edgeResistance: 0.65,
        onClick: function() {
            const winID = this.target.getAttribute("data-window");
            if(winID) window.openWindow(winID);
        }
    });

    // Draggable para Ventanas
    Draggable.create(".window", {
        trigger: ".window-header",
        bounds: "body",
        type: "x,y",
        onPress: function() { bringToFront(this.target); }
    });

    // Botones de control de ventana (TRAFFIC LIGHT)
    document.querySelectorAll(".close").forEach(btn => {
        btn.addEventListener("mousedown", e => e.stopPropagation()); 
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            closeWindow(e.target.closest(".window"));
        });
    });

    // Click en ventana la trae al frente
    windows.forEach(win => {
        win.addEventListener("mousedown", () => bringToFront(win));
    });

    // --- 4. DOCK INTERACTIVO (MAGNETIC + CLICK) ---
    dockIcons.forEach((icon) => {
        // Click
        icon.addEventListener("click", () => {
            const winID = icon.getAttribute("data-window");
            const link = icon.getAttribute("data-link");
            
            // Efecto de rebote al clickar
            gsap.to(icon, { y: -40, duration: 0.2, yoyo: true, repeat: 3 });

            if(winID) setTimeout(() => window.openWindow(winID), 200);
            if(link) setTimeout(() => window.open(link, '_blank'), 300);
        });

        // Efecto Magnético (Hover)
        icon.addEventListener("mousemove", (e) => {
            const rect = icon.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            gsap.to(icon, { x: x * 0.2, y: y * 0.2, scale: 1.1, duration: 0.3, ease: "power2.out" });
        });

        icon.addEventListener("mouseleave", () => {
            gsap.to(icon, { x: 0, y: 0, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
    });

    // --- 5. MENÚS SUPERIORES ---
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = item.classList.contains('active');
            // Cerrar todos primero
            menuItems.forEach(i => i.classList.remove('active'));
            // Si no estaba activo, abrirlo
            if (!isActive) item.classList.add('active');
        });
    });

    window.addEventListener('click', () => {
        menuItems.forEach(item => item.classList.remove('active'));
    });

    // --- 6. UTILIDADES (Reloj, Parallax, Sistema) ---
    
    // Reloj y fecha
    setInterval(() => {
        const now = new Date();

        // Fecha 
        const dateOptions = { weekday: 'short', day: 'numeric', month: 'short' };
        let dateString = now.toLocaleDateString('es-ES', dateOptions);
        
        // Limpieza de formato y mayúscula
        dateString = dateString.replace(/[.,]/g, "");
        dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);

        // hora
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit', 
            minute: '2-digit'
        });

        const el = document.getElementById('clock');
        if(el) el.innerText = `${dateString}  ${timeString}`;
    }, 1000);

    // Parallax Fondo
    document.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5);
        const y = (e.clientY / window.innerHeight - 0.5);
        gsap.to(".desktop-background", { duration: 1, x: x * 30, y: y * 30, ease: "power2.out" });
    });

    // Animación Scroll Proyectos
    setTimeout(() => {
        projectCards.forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    scroller: "#window-projects .window-content",
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                },
                y: 50, opacity: 0, duration: 0.6, ease: "power3.out", delay: index * 0.1
            });
        });
    }, 1500);

    // --- 7. ENVÍO DE FORMULARIO (con FIX RECARGA DE PÁGINA) ---
    const contactForm = document.getElementById("contact-form");
    const statusText = document.getElementById("form-status");

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault(); 

            const btn = document.getElementById("submit-btn");
            const originalText = btn.innerText;

            btn.innerText = "Enviando...";
            btn.style.opacity = "0.7";
            btn.disabled = true;

            setTimeout(() => {
                btn.innerText = "¡Enviado!";
                btn.style.backgroundColor = "var(--color-green)";
                btn.style.opacity = "1";
                
                if (statusText) {
                    statusText.style.display = "block";
                    statusText.innerText = "Mensaje enviado correctamente.";
                    statusText.className = "success-msg";
                }

                contactForm.reset();

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.backgroundColor = "";
                    if (statusText) statusText.style.display = "none";
                }, 3000);

            }, 1500);
        });
    }

    // Funcionalidad Apagar/Encender
    const blackScreen = document.getElementById("black-screen");
    const powerBtn = document.getElementById("power-on-btn");

    window.toggleSystem = function(turnOff) {
        if (turnOff) {
            gsap.to(blackScreen, { duration: 1.5, autoAlpha: 1, pointerEvents: "all", ease: "power2.inOut" });
            gsap.to(".window", { autoAlpha: 0, scale: 0.9 }); // Cerrar ventanas
        } else {
            gsap.to(blackScreen, { duration: 1.5, autoAlpha: 0, pointerEvents: "none", ease: "power2.inOut" });
        }
    };

    if(powerBtn) powerBtn.addEventListener("click", () => window.toggleSystem(false));

});