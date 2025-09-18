(function () {
  const { map, timeline, voices, archive, quiz } = window.APP_DATA;

  // Инициализация карты Leaflet
  const leaflet = L.map('leafletMap', { zoomControl: true }).setView(map.center, map.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(leaflet);

  const markers = [];

  function renderMarker(ev) {
    const marker = L.marker(ev.coords).addTo(leaflet);
    marker.bindPopup(`
      <strong>${ev.title}</strong><br/>
      <small>${new Date(ev.date).toLocaleDateString('ru-RU')}</small><br/>
      <p>${ev.summary}</p>
      ${ev.media?.[0] ? `<img src="${ev.media[0].src}" alt="${ev.media[0].caption}" style="max-width:200px;border-radius:8px; margin-top:6px;" />` : ""}
      <br/><button class="btn btn-small" data-open="${ev.id}">Подробнее</button>
    `);
    marker._data = ev;
    markers.push(marker);
  }

  map.events.forEach(renderMarker);

// Сохраняем маркеры по типам
const markersByType = {
  cities: [],
  fronts: [],
  partisans: []
};

// При добавлении маркеров в цикле:
window.APP_DATA.map.events.forEach(ev => {
  const marker = L.marker(ev.coords).bindPopup(`<strong>${ev.title}</strong><br>${ev.date}<br>${ev.summary}`);
  marker.addTo(map);
  markersByType[ev.type]?.push(marker);
});

// Функция фильтрации
function filterMapByLayers() {
  document.querySelectorAll('[data-layer]').forEach(cb => {
    const type = cb.getAttribute('data-layer');
    if (cb.checked) {
      markersByType[type].forEach(m => m.addTo(map));
    } else {
      markersByType[type].forEach(m => map.removeLayer(m));
    }
  });
}

// Обработчики чекбоксов
document.querySelectorAll('[data-layer]').forEach(cb => {
  cb.addEventListener('change', filterMapByLayers);
});


  
  function filterMapByYear(year) {
    markers.forEach(m => {
      const y = new Date(m._data.date).getFullYear();
      const visible = y <= year;
      if (visible) leaflet.addLayer(m); else leaflet.removeLayer(m);
    });
  }

  function filterMapByLayers() {
    const checked = [...document.querySelectorAll('[data-layer]')].filter(i => i.checked).map(i => i.dataset.layer);
    markers.forEach(m => {
      const visible = checked.includes(m._data.type);
      if (visible) leaflet.addLayer(m); else leaflet.removeLayer(m);
    });
  }

  // Панель справа (подробности)
  const sidebar = document.getElementById('mapSidebar');
  leaflet.on('popupopen', e => {
    const data = e.popup._source._data;
    sidebar.innerHTML = `
      <h3>${data.title}</h3>
      <p><strong>Дата:</strong> ${new Date(data.date).toLocaleDateString('ru-RU')}</p>
      <p>${data.summary}</p>
      ${data.media?.map(m => `<figure><img src="${m.src}" alt="${m.caption}"/><figcaption>${m.caption}</figcaption></figure>`).join('') || ""}
    `;
  });

  document.getElementById('yearRange').addEventListener('input', e => {
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

  // Голоса памяти
  const voicesList = document.getElementById('voicesList');
  voicesList.innerHTML = voices.map(v => `
    <article class="voice-card" role="listitem">
      <h3>${v.title}</h3>
      <p><strong>Автор:</strong> ${v.name}</p>
      <p><strong>Место:</strong> ${v.place}</p>
      <button class="btn" data-voice="${v.id}">Слушать</button>
    </article>
  `).join('');

  const voiceDialog = document.getElementById('voiceDialog');
  const voiceTitle = document.getElementById('voiceTitle');
  const voiceAudio = document.getElementById('voiceAudio');
  const voiceTranscript = document.getElementById('voiceTranscript');

  voicesList.addEventListener('click', e => {
    const id = e.target?.dataset?.voice;
    if (!id) return;
    const v = voices.find(x => x.id === id);
    voiceTitle.textContent = `${v.title} — ${v.name}`;
    voiceAudio.src = v.audio;
    voiceTranscript.textContent = v.transcript;
    voiceDialog.showModal();
  });
  voiceDialog.querySelector('.close').addEventListener('click', () => voiceDialog.close());

  // Архив
  const archiveGrid = document.getElementById('archiveGrid');
  archiveGrid.innerHTML = archive.map(a => `
    <div class="archive-item" role="listitem">
      <figure>
        <img src="${a.src}" alt="${a.caption}" loading="lazy" />
        <figcaption>${a.caption}</figcaption>
      </figure>
    </div>
  `).join('');

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
      alert('Пожалуйста, заполните обязательные поля.');
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
      alert('Языковые пакеты можно подключить через JSON и i18n-слой.');
    });
  });

  // Уважение к предпочтениям движения
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    leaflet.options.fadeAnimation = false;
    leaflet.options.zoomAnimation = false;
  }
})();

