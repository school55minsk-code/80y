(function () {
  const { map, timeline, voices, archive, quiz } = window.APP_DATA;

  const leaflet = L.map('leafletMap', { zoomControl: true }).setView(map.center, map.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(leaflet);

  const markers = [];
  const highlightCircles = [];

  function truncate(text, max = 100) {
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  function renderMarker(ev) {
    const marker = L.marker(ev.coords).addTo(leaflet);
    marker.bindPopup(`
      <strong>${ev.title}</strong><br/>
      <small>${new Date(ev.date).toLocaleDateString('ru-RU')}</small><br/>
      <p>${truncate(ev.summary)}</p>
      <br/><button class="btn btn-small" data-open="${ev.id}">Подробнее</button>
    `);
    marker._data = ev;
    markers.push(marker);

    const circle = L.circle(ev.coords, {
      radius: 20000,
      color: 'red',
      fillColor: 'red',
      fillOpacity: 0.3
    });
    circle._data = ev;
    highlightCircles.push(circle);
  }

  map.events.forEach(renderMarker);

  const bounds = [
    [50.0, 22.0],
    [57.5, 33.0]
  ];
  leaflet.setMaxBounds(bounds);
  leaflet.setMinZoom(5);
  leaflet.setMaxZoom(10);

  function filterMapByYear(year) {
    markers.forEach(m => {
      const y = new Date(m._data.date).getFullYear();
      const visible = y <= year;
      if (visible) leaflet.addLayer(m); else leaflet.removeLayer(m);
    });

    highlightCircles.forEach(c => {
      const y = new Date(c._data.date).getFullYear();
      const visible = y <= year;
      if (visible) leaflet.addLayer(c); else leaflet.removeLayer(c);
    });
  }

  function filterMapByLayers() {
    const checked = [...document.querySelectorAll('[data-layer]')]
      .filter(i => i.checked)
      .map(i => i.dataset.layer);

    markers.forEach(m => {
      const visible = checked.includes(m._data.type);
      if (visible) leaflet.addLayer(m); else leaflet.removeLayer(m);
    });

    highlightCircles.forEach(c => {
      const visible = checked.includes(c._data.type);
      if (visible) leaflet.addLayer(c); else leaflet.removeLayer(c);
    });
  }

  const sidebar = document.getElementById('mapSidebar');

  function scrollToSidebar() {
  //  sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('mapSidebar').scrollIntoView({ behavior: 'smooth' });

  }





// Кнопка "развернуть подробности"
const toggleBtn2 = document.createElement('button');
toggleBtn2.id = 'sidebarToggle';
toggleBtn2.textContent = 'Развернуть подробности';
sidebar.insertAdjacentElement('afterend', toggleBtn2);

// Функция рендера сайдбара
function renderSidebar(data) {
  sidebar.innerHTML = `
    <button class="hide-btn">Скрыть</button>
    <h3>${data.title}</h3>
    <p><strong>Дата:</strong> ${new Date(data.date).toLocaleDateString('ru-RU')}</p>
    <p>${data.summary}</p>
    <div class="media-gallery">
    ${data.media?.map(m => `
      <figure>
        <img src="${m.src}" alt="${m.caption}" />
        <figcaption>${m.caption}</figcaption>
      </figure>
    `).join('') || ""} </div>
  `;



  // показать сайдбар и скрыть кнопку "развернуть"
  sidebar.classList.add('active');
  toggleBtn2.style.display = 'none';

  // обработчик кнопки "Скрыть"
  sidebar.querySelector('.hide-btn').addEventListener('click', () => {
    sidebar.classList.remove('active');
    toggleBtn2.style.display = 'block';
  });
}

// обработчик кнопки "Развернуть подробности"
toggleBtn2.addEventListener('click', () => {
  sidebar.classList.add('active');
  toggleBtn2.style.display = 'none';
});

// при открытии попапа — кнопка "Подробнее" сразу разворачивает сайдбар
leaflet.on('popupopen', e => {
  const data = e.popup._source._data;
  const btn = e.popup._contentNode.querySelector('[data-open]');
  if (btn) {
    btn.addEventListener('click', () => {
      renderSidebar(data);
      sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});

  


  

  const yearRange = document.getElementById('yearRange');
  yearRange.addEventListener('input', e => {
    filterMapByYear(parseInt(e.target.value, 10));
  });

  document.querySelectorAll('[data-layer]').forEach(cb => {
    cb.addEventListener('change', filterMapByLayers);
  });

  document.getElementById('mapSearch').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    markers.forEach(m => {
      const match = m._data.title.toLowerCase().includes(q) || m._data.summary.toLowerCase().includes(q);
      if (match) leaflet.addLayer(m); else leaflet.removeLayer(m);
    });
  });

  filterMapByYear(parseInt(yearRange.value, 10));


/*
// Лента времени
  const timelineGrid = document.getElementById('timelineGrid');
  function renderTimeline(items) {
    timelineGrid.innerHTML = items.map(item => `
      <div class="timeline-item" role="listitem">
        <time datetime="${item.year}">${item.year}</time>
        <strong>${item.title}</strong>
        <p>${item.text}</p>
        <button class="btn" data-highlight="${item.tag}">Показать на карте</button>
      </div>
    `).join('');
  }
  renderTimeline(timeline);

  document.querySelectorAll('.timeline-controls .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.period;
      let items = timeline;
      if (p !== 'all') {
        if (p.includes('-')) {
          const [from, to] = p.split('-').map(Number);
          items = timeline.filter(i => i.year >= from && i.year <= to);
        } else {
          const y = Number(p);
          items = timeline.filter(i => i.year === y);
        }
      }
      renderTimeline(items);
    });
  });

  timelineGrid.addEventListener('click', e => {
    const tag = e.target?.dataset?.highlight;
    if (!tag) return;
    markers.forEach(m => {
      if (m._data.type === tag || m._data.id.includes(tag)) {
        m.openPopup();
        leaflet.setView(m.getLatLng(), 8, { animate: true });
      }
    });
  });

*/

  // Голоса памяти
const voicesList = document.getElementById('voicesList');
const toggleBtnVID = document.getElementById('toggleVoices'); // кнопка "Показать все / Скрыть"

// рендерим все карточки, но начиная с 5-й прячем
voicesList.innerHTML = voices.map((v, i) => `
  <article class="voice-card ${i >= 4 ? 'hidden' : ''}" role="listitem">
    <h3>${v.title}</h3>
    <p><strong>Автор:</strong> ${v.name}</p>
    <button class="videobtn" data-voice="${v.id}">Смотреть</button>
  </article>
`).join('');

const voiceDialog = document.getElementById('voiceDialog');
const voiceTitle = document.getElementById('voiceTitle');
const voiceVideo = document.getElementById('voiceVideo');
const voiceTranscript = document.getElementById('voiceTranscript');

// открытие диалога с видео
voicesList.addEventListener('click', e => {
  const id = e.target?.dataset?.voice;
  if (!id) return;
  const v = voices.find(x => x.id === id);
  voiceTitle.textContent = `${v.title} — ${v.name}`;
  voiceVideo.src = v.youtube + (v.youtube.includes('?') ? '&' : '?') + "autoplay=1";
  voiceTranscript.textContent = v.transcript;
  voiceDialog.showModal();
});

// при закрытии — очищаем src, чтобы видео останавливалось
voiceDialog.querySelector('.close').addEventListener('click', () => {
  voiceVideo.src = "";
  voiceDialog.close();
});

// переключение "Показать все / Скрыть"
toggleBtnVID.addEventListener('click', () => {
  const hiddenCards = voicesList.querySelectorAll('.voice-card.hidden');
  const isHidden = hiddenCards.length > 0;

  if (isHidden) {
    // показать все
    voicesList.querySelectorAll('.voice-card').forEach(c => c.classList.remove('hidden'));
    toggleBtnVID.textContent = 'Скрыть';
  } else {
    // скрыть обратно начиная с 5-й
    voicesList.querySelectorAll('.voice-card').forEach((c, i) => {
      if (i >= 4) c.classList.add('hidden');
    });
    toggleBtnVID.textContent = 'Показать все';
  }
});





// Архив
const archiveGrid = document.getElementById('archiveGrid');
const toggleBtn = document.getElementById('toggleArchiveBtn');
const archiveOverlay = document.getElementById('archiveOverlay');
const overlayImage = document.getElementById('overlayImage');
const overlayCaption = document.getElementById('overlayCaption');
const closeOverlayBtn = document.getElementById('closeArchiveOverlay');

archiveGrid.innerHTML = archive.map(a => `
  <div class="archive-item" role="listitem" data-src="${a.src}" data-caption="${a.caption}">
    <figure>
      <img src="${a.src}" alt="${a.caption}" loading="lazy" />
      <figcaption>${a.caption}</figcaption>
    </figure>
  </div>
`).join('');

const items = Array.from(archiveGrid.querySelectorAll('.archive-item'));

// Ограничение до 5 элементов
if (items.length > 5) {
  items.slice(5).forEach(el => el.classList.add('hidden'));
  toggleBtn.classList.remove('hidden');
  toggleBtn.textContent = 'Показать все';
} else {
  toggleBtn.classList.add('hidden');
}

// Кнопка показать/скрыть
toggleBtn.addEventListener('click', () => {
  const hiddenItems = items.slice(5);
  const isCollapsed = hiddenItems[0].classList.contains('hidden');
  if (isCollapsed) {
    hiddenItems.forEach(el => el.classList.remove('hidden'));
    toggleBtn.textContent = 'Скрыть';
  } else {
    hiddenItems.forEach(el => el.classList.add('hidden'));
    toggleBtn.textContent = 'Показать все';
  }
});

// Клик по элементу архива → открыть оверлей
archiveGrid.addEventListener('click', e => {
  const item = e.target.closest('.archive-item');
  if (!item) return;
  overlayImage.src = item.dataset.src;
  overlayCaption.textContent = item.dataset.caption;
  archiveOverlay.classList.remove('hidden');
});

// Закрытие оверлея
closeOverlayBtn.addEventListener('click', () => {
  archiveOverlay.classList.add('hidden');
});
archiveOverlay.addEventListener('click', e => {
  if (e.target === archiveOverlay) {
    archiveOverlay.classList.add('hidden');
  }
});



  

  // Квиз
  const quizQuestion = document.getElementById('quizQuestion');
  const quizAnswers = document.getElementById('quizAnswers');
  const nextBtn = document.getElementById('nextQuestion');
  const quizProgress = document.getElementById('quizProgress');
  let qi = 0, score = 0, answered = false;

  function renderQ() {
    const item = quiz[qi];
    quizQuestion.textContent = item.q;
    quizAnswers.innerHTML = item.answers.map((a, i) =>
      `<button class="btn" data-i="${i}">${a}</button>`).join('');
    nextBtn.disabled = true;
    answered = false;
    quizProgress.textContent = `Вопрос ${qi + 1} из ${quiz.length}`;
  }

  quizAnswers.addEventListener('click', e => {
    const i = Number(e.target?.dataset?.i);
    if (Number.isNaN(i) || answered) return;
    const item = quiz[qi];
    answered = true;
    [...quizAnswers.children].forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === item.correct) btn.style.borderColor = 'var(--focus)';
      if (idx === i && i !== item.correct) btn.style.borderColor = 'var(--accent)';
    });
    if (i === item.correct) score++;
    const explain = document.createElement('p');
    explain.style.marginTop = '8px';
    explain.textContent = item.explain;
    quizAnswers.appendChild(explain);
    nextBtn.disabled = false;
  });

  nextBtn.addEventListener('click', () => {
    qi++;
    if (qi >= quiz.length) {
      quizQuestion.textContent = `Готово! Ваш результат: ${score} из ${quiz.length}. Спасибо за участие.`;
      quizAnswers.innerHTML = '';
      nextBtn.disabled = true;
      localStorage.setItem('quizScore', JSON.stringify({ ts: Date.now(), score }));
      return;
    }
    renderQ();
  });

  renderQ();

  // Стена памяти (локально, для прототипа)
  const wallForm = document.getElementById('wallForm');
  const wallList = document.getElementById('wallList');
  let wallItems = JSON.parse(localStorage.getItem('wallItems') || '[]');

  function renderWall() {
    wallList.innerHTML = wallItems.map(w => `
      <article class="wall-card" role="listitem">
        <h4>${w.name}</h4>
        <p><strong>Место:</strong> ${w.place}</p>
        <p>${w.story}</p>
        ${w.photo ? `<img src="${w.photo}" alt="Фото, загруженное пользователем" />` : ""}
        <small>Ожидает модерации</small>
      </article>
    `).join('');
  }
  renderWall();

  wallForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(wallForm);
    const entry = {
      name: fd.get('name')?.toString().trim(),
      place: fd.get('place')?.toString().trim(),
      story: fd.get('story')?.toString().trim(),
      photo: null
    };
    const file = fd.get('photo');
    if (file && file.size) {
      entry.photo = await fileToDataURL(file);
    }
    if (!entry.name || !entry.place || !entry.story) {
      showToast('Пожалуйста, заполните обязательные поля.');
      return;
    }
    wallItems.unshift(entry);
    localStorage.setItem('wallItems', JSON.stringify(wallItems));
    wallForm.reset();
    renderWall();
  });

  
  function fileToDataURL(file) {
    return new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(file);
    });
  }

  // Переключение языков (заглушка)
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-switch button').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      showToast('Языковые пакеты можно подключить через JSON и i18n-слой.');
    });
  });

  // Уважение к предпочтениям движения
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    leaflet.options.fadeAnimation = false;
    leaflet.options.zoomAnimation = false;
  }


})();













