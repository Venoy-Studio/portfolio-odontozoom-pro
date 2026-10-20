
(function(){
  'use strict';

  // Reduce motion check
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-motion');

  // Dynamic Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Fictitious WhatsApp Number
  const FICTITIOUS_WHATSAPP = '5511987654321';

  /* ==========================================================================
     1. REAL-TIME CLINIC STATUS BADGE
     ========================================================================== */
  function updateClinicStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const hour = now.getHours();
    const statusPill = document.querySelectorAll('.clinic-status-pill');

    let isOpen = false;
    let closingTime = '20h';

    if (day >= 1 && day <= 5) { // Mon-Fri
      if (hour >= 8 && hour < 20) {
        isOpen = true;
        closingTime = '20:00';
      }
    } else if (day === 6) { // Sat
      if (hour >= 8 && hour < 15) {
        isOpen = true;
        closingTime = '15:00';
      }
    }

    statusPill.forEach(pill => {
      if (isOpen) {
        pill.innerHTML = '<span class="status-dot pulse"></span><span>Aberto hoje até às ' + closingTime + '</span>';
      } else {
        pill.innerHTML = '<span class="status-dot" style="background:#eab308"></span><span>Plantão 24h via WhatsApp</span>';
      }
    });
  }
  updateClinicStatus();

  /* ==========================================================================
     2. ACCESSIBLE MOBILE NAVIGATION
     ========================================================================== */
  const menuButton = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');
    }
  }
  if (menuButton && nav) {
    menuButton.addEventListener('click', function() {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });
  }

  /* ==========================================================================
     3. TOAST NOTIFICATIONS
     ========================================================================== */
  const toast = document.getElementById('toastNotification');
  let toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    const msgEl = toast.querySelector('.toast-text');
    if (msgEl) msgEl.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  /* ==========================================================================
     4. SERVICE TABS FILTER
     ========================================================================== */
  const tabs = Array.from(document.querySelectorAll('.service-tab'));
  const cards = Array.from(document.querySelectorAll('.service-card'));
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const filter = tab.dataset.filter;
    tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
    const hiding = cards.filter(card => card.dataset.category !== filter && filter !== 'all' && !card.hidden);
    const showing = cards.filter(card => (filter === 'all' || card.dataset.category === filter) && card.hidden);
    if (window.gsap && !reduceMotion) {
      gsap.to(hiding, {
        opacity: 0,
        y: 12,
        duration: 0.18,
        stagger: 0.015,
        onComplete: () => {
          hiding.forEach(c => c.hidden = true);
          showing.forEach(c => {
            c.hidden = false;
            gsap.fromTo(c, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.42, stagger: 0.04, ease: 'power3.out' });
          });
        }
      });
    } else {
      hiding.forEach(c => c.hidden = true);
      showing.forEach(c => c.hidden = false);
    }
  }));

  /* ==========================================================================
     5. INTERACTIVE BEFORE & AFTER SLIDER
     ========================================================================== */
  const baContainer = document.getElementById('baContainer');
  const baAfterWrapper = document.getElementById('baAfterWrapper');
  const baHandle = document.getElementById('baHandle');
  const baCases = {
    lentes: {
      title: 'Lentes de Contato Cerâmicas',
      desc: 'Correção de formato, diastemas e harmonização do arco do sorriso em 2 consultas.',
      before: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=80',
      after: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80'
    },
    clareamento: {
      title: 'Clareamento a Laser + Bio-Restaurações',
      desc: 'Remoção profunda de pigmentos e brilho natural sem causar hipersensibilidade dentinária.',
      before: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1000&q=80',
      after: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1000&q=80'
    },
    orto: {
      title: 'Alinhadores Invisíveis Digitais',
      desc: 'Alinhamento completo sem bráquetes metálicos, previsibilidade 3D e conforto absoluto.',
      before: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1000&q=80',
      after: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1000&q=80'
    }
  };

  if (baContainer && baAfterWrapper && baHandle) {
    let isSliding = false;

    function updateSlider(clientX) {
      const rect = baContainer.getBoundingClientRect();
      let pos = (clientX - rect.left) / rect.width;
      pos = Math.max(0.02, Math.min(0.98, pos));
      const pct = pos * 100;
      baAfterWrapper.style.width = pct + '%';
      baHandle.style.left = pct + '%';
    }

    baContainer.addEventListener('mousedown', e => {
      isSliding = true;
      updateSlider(e.clientX);
    });
    window.addEventListener('mousemove', e => {
      if (!isSliding) return;
      updateSlider(e.clientX);
    });
    window.addEventListener('mouseup', () => { isSliding = false; });

    // Touch support
    baContainer.addEventListener('touchstart', e => {
      isSliding = true;
      if (e.touches[0]) updateSlider(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      if (!isSliding || !e.touches[0]) return;
      updateSlider(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', () => { isSliding = false; });

    // Tab buttons for switching cases
    const baTabButtons = document.querySelectorAll('.ba-tab-btn');
    baTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        baTabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const caseKey = btn.dataset.case;
        const data = baCases[caseKey];
        if (data) {
          const beforeImg = document.getElementById('baImgBefore');
          const afterImg = document.getElementById('baImgAfter');
          const titleEl = document.getElementById('baTitle');
          const descEl = document.getElementById('baDesc');
          if (beforeImg) beforeImg.src = data.before;
          if (afterImg) afterImg.src = data.after;
          if (titleEl) titleEl.textContent = data.title;
          if (descEl) descEl.textContent = data.desc;
          baAfterWrapper.style.width = '50%';
          baHandle.style.left = '50%';
        }
      });
    });
  }

  /* ==========================================================================
     6. INTERACTIVE SMILE QUIZ / ADVISOR
     ========================================================================== */
  const quizStepPanes = document.querySelectorAll('.quiz-step-pane');
  const quizProgressBar = document.getElementById('quizProgressBar');
  const quizAnswers = { step1: '', step2: '', step3: '' };

  const quizRecommendations = {
    estetica: {
      title: 'Lentes de Contato Cerâmicas & Clareamento Guiado',
      desc: 'Indicado para transformar o formato, eliminar manchas e iluminar o sorriso com máxima naturalidade e conservação da estrutura dental.',
      time: 'Média de 2 a 3 consultas (15 a 21 dias)',
      doctor: 'Dra. Beatriz Mendes (Estética Oral Avançada)',
      serviceCode: 'facetas'
    },
    alinhamento: {
      title: 'Alinhadores Invisíveis Digitais (Invisalign)',
      desc: 'Tratamento ortodôntico de alta precisão 3D, removível, sem bráquetes metálicos e com previsibilidade milimétrica.',
      time: 'Média de 6 a 12 meses com consultas mensais',
      doctor: 'Dra. Camila Vasconcelos (Ortodontia Digital)',
      serviceCode: 'ortodontia'
    },
    reabilitacao: {
      title: 'Implantes Guiados & Reabilitação Oral Sem Dor',
      desc: 'Substituição segura e definitiva de dentes ausentes com cirurgia guiada por computador e rápida recuperação.',
      time: 'Etapa cirúrgica guiada em sessão única',
      doctor: 'Dr. Marcelo Siqueira (Implantodontia & Cirurgia)',
      serviceCode: 'proteses'
    },
    prevencao: {
      title: 'Protocolo de Profilaxia & Higiene Ultrassônica',
      desc: 'Remoção completa de biofilme e tártaro com tecnologia de ar condicionado ultrassônico e polimento estético.',
      time: 'Sessão única de 50 minutos',
      doctor: 'Dr. Lucas Albuquerque (Periodontia & Prevenção)',
      serviceCode: 'limpeza'
    }
  };

  function updateQuizStep(step) {
    quizStepPanes.forEach((pane, idx) => {
      pane.classList.toggle('active', idx === step);
    });
    if (quizProgressBar) {
      quizProgressBar.style.width = ((step + 1) / (quizStepPanes.length)) * 100 + '%';
    }
  }

  document.querySelectorAll('.quiz-option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const step = parseInt(this.dataset.step, 10);
      const val = this.dataset.val;
      quizAnswers['step' + step] = val;

      if (step < 3) {
        updateQuizStep(step);
      } else {
        // Compute recommendation
        let recKey = 'estetica';
        if (quizAnswers.step1 === 'alinhamento') recKey = 'alinhamento';
        else if (quizAnswers.step1 === 'ausente') recKey = 'reabilitacao';
        else if (quizAnswers.step1 === 'limpeza') recKey = 'prevencao';
        else recKey = 'estetica';

        const rec = quizRecommendations[recKey];
        const resTitle = document.getElementById('quizResTitle');
        const resDesc = document.getElementById('quizResDesc');
        const resTime = document.getElementById('quizResTime');
        const resDoc = document.getElementById('quizResDoctor');
        const resBtn = document.getElementById('quizResCta');

        if (resTitle) resTitle.textContent = rec.title;
        if (resDesc) resDesc.textContent = rec.desc;
        if (resTime) resTime.textContent = rec.time;
        if (resDoc) resDoc.textContent = rec.doctor;
        if (resBtn) {
          resBtn.onclick = () => openBookingModal(rec.serviceCode);
        }

        updateQuizStep(3); // Result pane
      }
    });
  });

  const quizResetBtn = document.getElementById('quizResetBtn');
  if (quizResetBtn) {
    quizResetBtn.addEventListener('click', () => {
      quizAnswers.step1 = '';
      quizAnswers.step2 = '';
      quizAnswers.step3 = '';
      updateQuizStep(0);
    });
  }

  /* ==========================================================================
     7. SMART BOOKING MODAL
     ========================================================================== */
  const modalOverlay = document.getElementById('bookingModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalPills = document.querySelectorAll('.modal-service-pill');
  let selectedService = 'Consulta / Avaliação Geral';

  window.openBookingModal = function(preferredService) {
    if (!modalOverlay) return;
    if (preferredService) {
      modalPills.forEach(p => {
        if (p.dataset.service.toLowerCase().includes(preferredService.toLowerCase())) {
          p.click();
        }
      });
    }
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const s = btn.dataset.service || '';
      openBookingModal(s);
    });
  });

  modalPills.forEach(pill => {
    pill.addEventListener('click', () => {
      modalPills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      selectedService = pill.dataset.service;
    });
  });

  // Phone masking helper: (11) 98765-4321
  function maskPhone(input) {
    input.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 6) {
        v = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
      } else if (v.length > 2) {
        v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
      } else if (v.length > 0) {
        v = '(' + v;
      }
      e.target.value = v;
    });
  }

  const modalPhoneInput = document.getElementById('modalPhone');
  if (modalPhoneInput) maskPhone(modalPhoneInput);
  const bottomPhoneInput = document.getElementById('phone');
  if (bottomPhoneInput) maskPhone(bottomPhoneInput);

  // Modal Multi-step Wizard
  let currentModalStep = 1;
  const modalPanes = document.querySelectorAll('.modal-step-pane');
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const modalNextBtn = document.getElementById('modalNextBtn');
  const modalPrevBtn = document.getElementById('modalPrevBtn');

  function setModalStep(s) {
    currentModalStep = s;
    modalPanes.forEach((p, i) => p.classList.toggle('active', i + 1 === s));
    stepIndicators.forEach((ind, i) => ind.classList.toggle('active', i + 1 <= s));
    if (modalPrevBtn) modalPrevBtn.style.display = s > 1 ? 'inline-flex' : 'none';
    if (modalNextBtn) {
      if (s === 3) {
        modalNextBtn.innerHTML = '<span class="btn-label">Confirmar no WhatsApp</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
      } else {
        modalNextBtn.innerHTML = '<span class="btn-label">Avançar</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
      }
    }
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', () => {
      if (currentModalStep === 1) {
        setModalStep(2);
      } else if (currentModalStep === 2) {
        setModalStep(3);
      } else if (currentModalStep === 3) {
        // Submit
        const name = (document.getElementById('modalName') ? document.getElementById('modalName').value : '').trim();
        const phone = (document.getElementById('modalPhone') ? document.getElementById('modalPhone').value : '').trim();
        const doctor = (document.getElementById('modalDoctor') ? document.getElementById('modalDoctor').value : 'Primeiro disponível');
        const shift = (document.getElementById('modalShift') ? document.getElementById('modalShift').value : 'Qualquer horário');
        const notes = (document.getElementById('modalNotes') ? document.getElementById('modalNotes').value : '').trim();

        if (!name || !phone) {
          alert('Por favor, preencha o seu nome e telefone.');
          return;
        }

        const lines = [
          'Olá, Odonto Zoom! Gostaria de agendar uma consulta.',
          '• Nome: ' + name,
          '• Contato: ' + phone,
          '• Serviço desejado: ' + selectedService,
          '• Especialista: ' + doctor,
          '• Preferência de horário: ' + shift
        ];
        if (notes) lines.push('• Observações: ' + notes);

        const url = 'https://wa.me/' + FICTITIOUS_WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
        showToast('Pré-agendamento gerado! Abrindo o WhatsApp...');
        closeModal();
        setTimeout(() => {
          const w = window.open(url, '_blank', 'noopener,noreferrer');
          if (!w) window.location.href = url;
        }, 600);
      }
    });
  }

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', () => {
      if (currentModalStep > 1) setModalStep(currentModalStep - 1);
    });
  }

  /* ==========================================================================
     8. BOTTOM CONTACT FORM (WhatsApp Redirection)
     ========================================================================== */
  const contactForm = document.getElementById('appointmentForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();
      if (!this.reportValidity()) return;
      const d = new FormData(this);
      const lines = [
        'Olá, Odonto Zoom! Gostaria de pedir informações.',
        '• Nome: ' + d.get('name'),
        '• Contato: ' + d.get('phone'),
        '• Serviço: ' + d.get('service')
      ];
      if (String(d.get('message') || '').trim()) {
        lines.push('• Mensagem: ' + String(d.get('message')).trim());
      }
      const url = 'https://wa.me/' + FICTITIOUS_WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
      showToast('Mensagem preparada! Abrindo o WhatsApp...');
      setTimeout(() => {
        const w = window.open(url, '_blank', 'noopener,noreferrer');
        if (!w) window.location.href = url;
      }, 500);
    });
  }

  /* ==========================================================================
     9. HORIZONTAL GALLERY (Touch/Drag on mobile, Pinned on desktop)
     ========================================================================== */
  const viewport = document.getElementById('galleryViewport');
  const track = document.getElementById('galleryTrack');
  let dragging = false, startX = 0, startScroll = 0, moved = 0;
  const desktopHorizontalQuery = '(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)';
  const shouldPinGallery = () => window.matchMedia(desktopHorizontalQuery).matches && !!window.gsap && !!window.ScrollTrigger && track && viewport && track.scrollWidth > viewport.clientWidth + 24;

  if (viewport && track) {
    viewport.addEventListener('pointerdown', e => {
      if (shouldPinGallery()) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startScroll = viewport.scrollLeft;
      viewport.classList.add('dragging');
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    });
    viewport.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      viewport.scrollLeft = startScroll - dx;
    });
    function endDrag() {
      dragging = false;
      viewport.classList.remove('dragging');
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('lostpointercapture', endDrag);
    viewport.addEventListener('click', e => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  /* ==========================================================================
     10. GSAP & LENIS MOTION SUITE
     ========================================================================== */
  if (!reduceMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    let lenis = null;
    if (window.Lenis) {
      try {
        lenis = new Lenis({
          duration: 1.05,
          easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          autoRaf: false
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      } catch (err) {
        lenis = null;
      }
    }

    // In-page smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#top') {
          e.preventDefault();
          if (lenis) lenis.scrollTo(0, { offset: 0 });
          else window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -72 });
        else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Pinned horizontal gallery
    const gallerySection = document.querySelector('.gallery-section');
    const galleryWrap = gallerySection ? gallerySection.querySelector('.wrap') : null;
    if (gallerySection && galleryWrap && track && viewport && gsap.matchMedia) {
      const horizontalMM = gsap.matchMedia();
      horizontalMM.add(desktopHorizontalQuery, () => {
        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
        if (distance() < 24) return;
        gallerySection.classList.add('is-pinned-horizontal');
        const horizontalTween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: gallerySection,
            start: 'top top+=76',
            end: () => '+=' + Math.max(1, distance()),
            pin: galleryWrap,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        gsap.utils.toArray('.gallery-card').forEach((card, i) => {
          gsap.to(card, {
            y: i % 2 === 0 ? -12 : 12,
            ease: 'none',
            scrollTrigger: {
              trigger: gallerySection,
              start: 'top top+=76',
              end: () => '+=' + Math.max(1, distance()),
              scrub: 1,
              invalidateOnRefresh: true
            }
          });
        });
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => {
          horizontalTween.scrollTrigger && horizontalTween.scrollTrigger.kill();
          gallerySection.classList.remove('is-pinned-horizontal');
          gsap.set(track, { clearProps: 'transform' });
        };
      });
      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    }

    // Split scroll pinned section (Section 05)
    const splitSection = document.querySelector('.split-scroll-section');
    const splitPin = splitSection ? splitSection.querySelector('.split-scroll-pin') : null;
    const splitText = splitSection ? splitSection.querySelector('.split-scroll-text') : null;
    if (splitSection && splitPin && splitText && gsap.matchMedia) {
      const splitMedia = gsap.matchMedia();
      splitMedia.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
        const originalText = splitText.textContent.trim();
        splitSection.classList.add('is-split-pinned');
        splitText.textContent = '';
        Array.from(originalText).forEach(character => {
          const span = document.createElement('span');
          if (character === ' ') {
            span.className = 'split-scroll-space';
            span.textContent = '\u00a0';
          } else {
            span.className = 'split-scroll-letter';
            span.textContent = character;
          }
          span.setAttribute('aria-hidden', 'true');
          splitText.appendChild(span);
        });
        const letters = Array.from(splitText.querySelectorAll('.split-scroll-letter'));
        const distance = () => Math.max(1, splitText.scrollWidth - window.innerWidth);
        const horizontalTween = gsap.to(splitText, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: splitSection,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: splitPin,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        letters.forEach(letter => {
          const verticalSign = Math.random() < 0.5 ? -1 : 1;
          const rotationSign = Math.random() < 0.5 ? -1 : 1;
          const startY = (Math.floor(Math.random() * 7) + 10) * verticalSign * 10;
          const startRotation = (Math.floor(Math.random() * 11) + 10) * rotationSign;
          gsap.fromTo(letter, { yPercent: startY, rotation: startRotation }, {
            yPercent: 0,
            rotation: 0,
            ease: 'elastic.out(1.2, 1)',
            scrollTrigger: {
              trigger: letter,
              containerAnimation: horizontalTween,
              start: 'left 100%',
              end: 'left 0%',
              scrub: 0.5,
              invalidateOnRefresh: true
            }
          });
        });
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => {
          splitSection.classList.remove('is-split-pinned');
          gsap.set(splitText, { clearProps: 'transform' });
          splitText.textContent = originalText;
        };
      });
    }

    // Hero title staggered reveal
    const title = document.querySelector('.hero-title');
    try {
      if (window.SplitText) {
        const split = new SplitText(title, { type: 'lines,words,chars', linesClass: 'split-line', wordsClass: 'split-word', charsClass: 'split-char' });
        gsap.set(split.chars, { yPercent: 115, rotateX: -50, transformOrigin: '50% 100%', opacity: 0 });
        gsap.to(split.chars, {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: 0.85,
          stagger: { each: 0.018, from: 'start' },
          ease: 'power4.out',
          delay: 0.12,
          onComplete: () => {
            split.revert();
            document.querySelectorAll('.text-highlight').forEach(el => el.classList.add('is-on'));
          }
        });
      } else {
        gsap.fromTo(title, { y: 35, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          onComplete: () => document.querySelectorAll('.text-highlight').forEach(el => el.classList.add('is-on'))
        });
      }
    } catch (err) {
      gsap.fromTo(title, { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
    }

    gsap.from('.hero-eyebrow', { y: 14, opacity: 0, duration: 0.6, delay: 0.05, ease: 'power2.out' });
    gsap.from('.hero-copy > p, .hero-buttons, .hero-contact, .hero-proof', { y: 22, opacity: 0, duration: 0.7, delay: 0.45, stagger: 0.1, ease: 'power3.out' });
    gsap.from('.hero-photo', { y: 55, opacity: 0, rotate: 0, scale: 0.96, duration: 1.05, stagger: 0.13, delay: 0.22, ease: 'power3.out' });
    gsap.from('.floating-note', { y: 18, opacity: 0, scale: 0.88, delay: 0.8, duration: 0.7, ease: 'back.out(1.6)' });

    // Scroll reveals
    gsap.utils.toArray('.reveal').forEach(el => {
      gsap.fromTo(el, { y: 24, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.78,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    gsap.utils.toArray('.service-card, .doctor-card, .bento-card, .review-card').forEach((el, i) => {
      gsap.fromTo(el, { y: 30, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.65,
        delay: (i % 4) * 0.07,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });

    gsap.utils.toArray('.step').forEach((el, i) => {
      gsap.fromTo(el, { y: 20, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    // Hero image collage parallax
    const visual = document.querySelector('.hero-visual');
    const photoEls = gsap.utils.toArray('.parallax-card');
    if (visual && window.matchMedia('(pointer:fine)').matches) {
      let qx = gsap.quickTo(photoEls[0], 'x', { duration: 0.55, ease: 'power3' });
      let qy = gsap.quickTo(photoEls[0], 'y', { duration: 0.55, ease: 'power3' });
      visual.addEventListener('pointermove', e => {
        const r = visual.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        qx(x * 13);
        qy(y * 13);
        photoEls.slice(1).forEach((el, i) => {
          gsap.to(el, { x: x * (i ? -11 : 8), y: y * (i ? 8 : -7), duration: 0.65, ease: 'power2.out', overwrite: 'auto' });
        });
      });
      visual.addEventListener('pointerleave', () => {
        photoEls.forEach(el => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' }));
      });
    }
    gsap.to('.hero-visual', { y: 36, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.7 } });

    // Marquee
    gsap.to('#marqueeTrack', { xPercent: -50, ease: 'none', duration: 24, repeat: -1 });

    // Image zoom on reveal
    gsap.utils.toArray('.gallery-card img, .service-image img, .consult-visual img').forEach(img => {
      gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.1, ease: 'power2.out', scrollTrigger: { trigger: img, start: 'top 92%', once: true } });
    });

    // Sticky header and progress bar
    const header = document.querySelector('.site-header');
    const syncHeader = () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      gsap.to(progressBar, { width: '100%', ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.1 } });
    }

    // Tiny cursor glow on desktop
    const glow = document.querySelector('.mouse-glow');
    if (glow && window.matchMedia('(pointer:fine)').matches) {
      window.addEventListener('pointermove', e => {
        gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.6, ease: 'power2.out', overwrite: true });
      }, { passive: true });
      document.body.classList.add('is-loaded');
    }
  } else {
    document.documentElement.classList.remove('js-motion');
    document.querySelectorAll('.text-highlight').forEach(el => el.classList.add('is-on'));
    const pb = document.getElementById('progressBar');
    if (pb) pb.style.width = '0';
  }

  // Accordion FAQ: single open item
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', function() {
      if (!this.open) return;
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== this) other.open = false;
      });
    });
  });

})();
