/* =============================================
   CardVault — App Logic (app.js)
   ============================================= */

'use strict';

// =============================================
// State
// =============================================
const STATE = {
  contacts: [],
  filter: 'all',
  activeTag: null,
  searchQuery: '',
  viewMode: 'grid',
  editingId: null,
  openContactId: null,
  editingTags: [],
};

// =============================================
// Data Helpers
// =============================================
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getColorClass(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `avatar-color-${Math.abs(hash) % 8}`;
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function saveContacts() {
  localStorage.setItem('cardvault_contacts', JSON.stringify(STATE.contacts));
}

function loadContacts() {
  try {
    STATE.contacts = JSON.parse(localStorage.getItem('cardvault_contacts') || '[]');
  } catch {
    STATE.contacts = [];
  }
}

function getSampleContacts() {
  return [
    {
      id: genId(),
      name: '張偉明',
      title: '業務總監',
      company: '台灣科技股份有限公司',
      phone: '+886 2 2345 6789',
      email: 'wei.zhang@twtech.com.tw',
      address: '台北市信義區松仁路100號',
      website: 'https://twtech.com.tw',
      tags: ['VIP', '科技業'],
      favorite: true,
      notes: '重要合作夥伴，每月固定開會。偏好以Line溝通。',
      interactions: [
        { id: genId(), date: '2026-05-10', type: '會議', note: '季度業績回顧，討論下半年合作方案' },
        { id: genId(), date: '2026-04-25', type: '電話', note: '確認合約修訂細節' },
      ],
      createdAt: Date.now() - 86400000 * 10,
      updatedAt: Date.now() - 86400000 * 2,
    },
    {
      id: genId(),
      name: '林美玲',
      title: '行銷經理',
      company: '創意廣告有限公司',
      phone: '+886 9 8765 4321',
      email: 'meilin@creative-ad.com',
      address: '台北市大安區敦化南路二段99號',
      website: 'https://creative-ad.com',
      tags: ['行銷', '潛在客戶'],
      favorite: false,
      notes: '對數位行銷方案有高度興趣，需要跟進提案。',
      interactions: [
        { id: genId(), date: '2026-05-15', type: 'Email', note: '寄送數位行銷提案書' },
      ],
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 1,
    },
    {
      id: genId(),
      name: '陳建宏',
      title: '軟體工程師',
      company: 'InnoTech Solutions',
      phone: '+886 9 1234 5678',
      email: 'jim.chen@innotech.io',
      address: '',
      website: 'https://innotech.io',
      tags: ['工程師', '技術合作'],
      favorite: false,
      notes: '熟悉 AWS 架構，可協助系統整合。',
      interactions: [],
      createdAt: Date.now() - 86400000 * 3,
      updatedAt: Date.now() - 86400000 * 3,
    },
    {
      id: genId(),
      name: '王淑芬',
      title: '財務長',
      company: '華南金融集團',
      phone: '+886 2 3456 7890',
      email: 'shufen.wang@huanan-finance.com',
      address: '台北市中山區南京東路三段168號',
      website: '',
      tags: ['金融', 'VIP'],
      favorite: true,
      notes: '需要定期提供財務報表。每年Q4特別忙。',
      interactions: [
        { id: genId(), date: '2026-05-01', type: '拜訪', note: '年度財務審查會議，討論明年預算' },
        { id: genId(), date: '2026-03-15', type: '電話', note: '第一季報表確認' },
      ],
      createdAt: Date.now() - 86400000 * 20,
      updatedAt: Date.now() - 86400000 * 5,
    },
  ];
}

// =============================================
// DOM Refs
// =============================================
const $ = id => document.getElementById(id);
const $c = cls => document.querySelector('.' + cls);

const sidebar = $('sidebar');
const sidebarToggle = $('sidebar-toggle');
const searchInput = $('search-input');
const clearSearchBtn = $('clear-search');
const navAll = $('nav-all');
const navFavorite = $('nav-favorite');
const badgeAll = $('badge-all');
const badgeFavorite = $('badge-favorite');
const tagFilterList = $('tag-filter-list');
const mainTitle = $('main-title');
const contactCount = $('contact-count');
const contactsContainer = $('contacts-container');
const emptyState = $('empty-state');
const viewGridBtn = $('view-grid');
const viewListBtn = $('view-list');

// Modal
const modalOverlay = $('modal-overlay');
const modal = $('modal');
const modalTitle = $('modal-title');
const modalClose = $('modal-close');
const modalCancel = $('modal-cancel');
const modalSave = $('modal-save');
const contactForm = $('contact-form');
const formAvatar = $('form-avatar');

// Form fields
const fName = $('f-name');
const fTitle = $('f-title');
const fCompany = $('f-company');
const fPhone = $('f-phone');
const fEmail = $('f-email');
const fAddress = $('f-address');
const fWebsite = $('f-website');
const fTags = $('f-tags');
const tagChips = $('tag-chips');
const fNotes = $('f-notes');

// Detail
const detailPanel = $('detail-panel');
const detailOverlay = $('detail-overlay');
const closeDetail = $('close-detail');
const detailContent = $('detail-content');
const detailFavBtn = $('detail-favorite-btn');
const detailEditBtn = $('detail-edit-btn');
const detailDeleteBtn = $('detail-delete-btn');
const detailCardPreviewBtn = $('detail-card-preview-btn');

// Interaction Modal
const interactionModalOverlay = $('interaction-modal-overlay');
const interactionModalClose = $('interaction-modal-close');
const interactionCancel = $('interaction-cancel');
const interactionSave = $('interaction-save');
const iDate = $('i-date');
const iType = $('i-type');
const iNote = $('i-note');

// Toast
const toastContainer = $('toast-container');

// =============================================
// Toast System
// =============================================
function showToast(message, type = 'info', icon = '') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon || icons[type]}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// =============================================
// Render
// =============================================
function getFilteredContacts() {
  let contacts = [...STATE.contacts];
  if (STATE.filter === 'favorite') contacts = contacts.filter(c => c.favorite);
  if (STATE.activeTag) contacts = contacts.filter(c => c.tags && c.tags.includes(STATE.activeTag));
  if (STATE.searchQuery) {
    const q = STATE.searchQuery.toLowerCase();
    contacts = contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
    );
  }
  return contacts;
}

function getAllTags() {
  const tags = new Map();
  STATE.contacts.forEach(c => {
    (c.tags || []).forEach(t => {
      tags.set(t, (tags.get(t) || 0) + 1);
    });
  });
  return tags;
}

function renderTagFilterList() {
  const tags = getAllTags();
  tagFilterList.innerHTML = '';
  if (tags.size === 0) return;

  tags.forEach((count, tag) => {
    const item = document.createElement('button');
    item.className = `tag-filter-item${STATE.activeTag === tag ? ' active' : ''}`;
    item.dataset.tag = tag;
    item.innerHTML = `
      <span class="tag-dot" style="background:var(--accent)"></span>
      <span>${tag}</span>
      <span class="badge" style="margin-left:auto">${count}</span>
    `;
    item.addEventListener('click', () => {
      STATE.activeTag = STATE.activeTag === tag ? null : tag;
      if (STATE.activeTag) {
        STATE.filter = 'all';
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      }
      render();
    });
    tagFilterList.appendChild(item);
  });
}

function renderBadges() {
  badgeAll.textContent = STATE.contacts.length;
  badgeFavorite.textContent = STATE.contacts.filter(c => c.favorite).length;
}

function renderContactCard(contact) {
  const card = document.createElement('div');
  card.className = 'contact-card';
  card.dataset.id = contact.id;

  const colorClass = getColorClass(contact.name);
  const initials = getInitials(contact.name);

  const metaItems = [];
  if (contact.email) metaItems.push({
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    value: contact.email
  });
  if (contact.phone) metaItems.push({
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    value: contact.phone
  });

  const tagsHtml = (contact.tags || []).map(t => `<span class="tag-chip">${t}</span>`).join('');

  card.innerHTML = `
    <div class="card-top">
      <div class="card-avatar ${colorClass}">${initials}</div>
      <div class="card-info">
        <div class="card-name">${escHtml(contact.name)}</div>
        ${contact.title ? `<div class="card-title">${escHtml(contact.title)}</div>` : ''}
        ${contact.company ? `<div class="card-company">${escHtml(contact.company)}</div>` : ''}
      </div>
      <button class="card-fav-btn${contact.favorite ? ' active' : ''}" data-id="${contact.id}" aria-label="收藏">
        <svg viewBox="0 0 24 24" fill="${contact.favorite ? 'var(--warning)' : 'none'}" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    </div>
    ${metaItems.length > 0 ? `<div class="card-divider"></div>
    <div class="card-meta">
      ${metaItems.map(m => `<div class="card-meta-item">${m.icon}<span>${escHtml(m.value)}</span></div>`).join('')}
    </div>` : ''}
    ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ''}
  `;

  card.querySelector('.card-fav-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(contact.id);
  });

  card.addEventListener('click', () => openDetailPanel(contact.id));
  return card;
}

function render() {
  renderBadges();
  renderTagFilterList();

  const filtered = getFilteredContacts();
  contactsContainer.innerHTML = '';

  // Header title
  if (STATE.activeTag) {
    mainTitle.textContent = `#${STATE.activeTag}`;
  } else if (STATE.filter === 'favorite') {
    mainTitle.textContent = '收藏客戶';
  } else {
    mainTitle.textContent = '所有客戶';
  }

  contactCount.textContent = filtered.length > 0 ? `${filtered.length} 位客戶` : '';

  // Empty state
  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    contactsContainer.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    contactsContainer.style.display = '';
    filtered.forEach((contact, i) => {
      const card = renderContactCard(contact);
      card.style.animationDelay = `${i * 0.04}s`;
      contactsContainer.appendChild(card);
    });
  }

  // View mode
  contactsContainer.className = STATE.viewMode === 'list' ? 'contacts-grid list-view' : 'contacts-grid';
  viewGridBtn.classList.toggle('active', STATE.viewMode === 'grid');
  viewListBtn.classList.toggle('active', STATE.viewMode === 'list');

  // Nav active
  navAll.classList.toggle('active', STATE.filter === 'all' && !STATE.activeTag);
  navFavorite.classList.toggle('active', STATE.filter === 'favorite');

  // Tag filter list active
  document.querySelectorAll('.tag-filter-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tag === STATE.activeTag);
  });
}

// =============================================
// Detail Panel
// =============================================
function getInteractionEmoji(type) {
  const map = { '電話': '📞', 'Email': '📧', '會議': '🤝', '拜訪': '🏢', '其他': '💬' };
  return map[type] || '💬';
}

function renderDetailContent(contact) {
  const colorClass = getColorClass(contact.name);
  const initials = getInitials(contact.name);

  const infoRows = [];
  if (contact.phone) infoRows.push({
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    label: '電話', value: contact.phone, copyValue: contact.phone
  });
  if (contact.email) infoRows.push({
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    label: 'Email', value: `<a href="mailto:${contact.email}">${escHtml(contact.email)}</a>`, copyValue: contact.email
  });
  if (contact.address) infoRows.push({
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    label: '地址', value: contact.address, copyValue: contact.address
  });
  if (contact.website) infoRows.push({
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    label: '網站', value: `<a href="${contact.website}" target="_blank" rel="noopener">${escHtml(contact.website)}</a>`, copyValue: contact.website
  });

  const interactions = (contact.interactions || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  detailContent.innerHTML = `
    <div class="detail-profile">
      <div class="detail-avatar ${colorClass}">${initials}</div>
      <div class="detail-name">${escHtml(contact.name)}</div>
      ${contact.title ? `<div class="detail-title">${escHtml(contact.title)}</div>` : ''}
      ${contact.company ? `<div class="detail-company">${escHtml(contact.company)}</div>` : ''}
      ${(contact.tags || []).length > 0
        ? `<div class="detail-tags">${contact.tags.map(t => `<span class="tag-chip">${t}</span>`).join('')}</div>`
        : ''}
    </div>

    ${infoRows.length > 0 ? `
    <div class="detail-section">
      <div class="detail-section-title">聯絡資訊</div>
      ${infoRows.map(row => `
        <div class="detail-info-row">
          <div class="detail-info-icon">${row.icon}</div>
          <div class="detail-info-content">
            <div class="detail-info-label">${row.label}</div>
            <div class="detail-info-value">${row.value}</div>
          </div>
          <button class="detail-copy-btn" data-copy="${escHtml(row.copyValue)}" aria-label="複製">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      `).join('')}
    </div>` : ''}

    ${contact.notes ? `
    <div class="detail-section">
      <div class="detail-section-title">備註</div>
      <div class="detail-notes-text">${escHtml(contact.notes)}</div>
    </div>` : ''}

    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span style="font-size:13px;font-weight:600;color:var(--text-secondary)">互動記錄</span>
        <span style="font-size:12px;color:var(--text-muted)">${interactions.length} 筆</span>
      </div>
      <div class="interaction-timeline" id="interaction-timeline">
        ${interactions.map(inter => `
          <div class="interaction-item" data-iid="${inter.id}">
            <div class="interaction-type-badge">${getInteractionEmoji(inter.type)}</div>
            <div class="interaction-content">
              <div class="interaction-meta">
                <span class="interaction-type">${escHtml(inter.type)}</span>
                <span class="interaction-date">${formatDate(inter.date)}</span>
              </div>
              <div class="interaction-note">${escHtml(inter.note)}</div>
            </div>
            <button class="interaction-delete-btn" data-iid="${inter.id}" aria-label="刪除">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        `).join('')}
      </div>
      <button class="add-interaction-btn" id="add-interaction-btn" style="margin-top:${interactions.length > 0 ? '10px' : '0'}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新增互動記錄
      </button>
    </div>
  `;

  // Bind copy buttons
  detailContent.querySelectorAll('.detail-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy).then(() => showToast('已複製到剪貼簿', 'success'));
    });
  });

  // Bind interaction delete
  detailContent.querySelectorAll('.interaction-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteInteraction(contact.id, btn.dataset.iid));
  });

  // Bind add interaction
  $('add-interaction-btn').addEventListener('click', () => openInteractionModal(contact.id));

  // Update fav button
  detailFavBtn.classList.toggle('active', contact.favorite);
  detailFavBtn.querySelector('polygon').setAttribute('fill', contact.favorite ? 'var(--warning)' : 'none');
}

function openDetailPanel(contactId) {
  const contact = STATE.contacts.find(c => c.id === contactId);
  if (!contact) return;
  STATE.openContactId = contactId;
  renderDetailContent(contact);
  detailPanel.classList.add('open');
  detailOverlay.classList.add('active');
}

function closeDetailPanel() {
  detailPanel.classList.remove('open');
  detailOverlay.classList.remove('active');
  setTimeout(() => { STATE.openContactId = null; }, 350);
}

function toggleFavorite(contactId) {
  const contact = STATE.contacts.find(c => c.id === contactId);
  if (!contact) return;
  contact.favorite = !contact.favorite;
  contact.updatedAt = Date.now();
  saveContacts();
  render();
  if (STATE.openContactId === contactId) {
    renderDetailContent(contact);
  }
  showToast(contact.favorite ? '已加入收藏 ⭐' : '已取消收藏', 'info');
}

function deleteContact(contactId) {
  if (!confirm('確定要刪除此客戶資料嗎？')) return;
  STATE.contacts = STATE.contacts.filter(c => c.id !== contactId);
  saveContacts();
  closeDetailPanel();
  render();
  showToast('已刪除客戶', 'info');
}

// =============================================
// Business Card Preview (Front & Back)
// =============================================
function openCardPreview(contactId) {
  const contact = STATE.contacts.find(c => c.id === contactId);
  if (!contact) return;

  const colorClass = getColorClass(contact.name);
  const initials = getInitials(contact.name);

  // --- Front face ---
  const avatarEl = $('biz-card-avatar');
  avatarEl.className = `biz-card-logo-area ${colorClass}`;
  avatarEl.textContent = initials;

  $('biz-front-name').textContent = contact.name || '';
  $('biz-front-title').textContent = contact.title || '';
  $('biz-front-company').textContent = contact.company || '';

  const phoneEl = $('biz-front-phone');
  if (contact.phone) {
    phoneEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${escHtml(contact.phone)}`;
  } else { phoneEl.innerHTML = ''; }

  const emailEl = $('biz-front-email');
  if (contact.email) {
    emailEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${escHtml(contact.email)}`;
  } else { emailEl.innerHTML = ''; }

  // --- Back face ---
  const backAvatarEl = $('biz-back-avatar');
  backAvatarEl.className = `biz-back-logo ${colorClass}`;
  backAvatarEl.textContent = initials;

  const addrEl = $('biz-back-address');
  if (contact.address) {
    addrEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${escHtml(contact.address)}`;
  } else { addrEl.innerHTML = ''; }

  const webEl = $('biz-back-website');
  if (contact.website) {
    webEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>${escHtml(contact.website)}`;
  } else { webEl.innerHTML = ''; }

  const notesEl = $('biz-back-notes');
  if (contact.notes) {
    const shortNote = contact.notes.length > 60 ? contact.notes.slice(0, 60) + '…' : contact.notes;
    notesEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>${escHtml(shortNote)}`;
  } else { notesEl.innerHTML = ''; }

  const tagsEl = $('biz-back-tags');
  tagsEl.innerHTML = (contact.tags || []).map(t => `<span class="biz-back-tag">${escHtml(t)}</span>`).join('');

  // Reset flip state
  $('card-flip-card').classList.remove('flipped');

  // Show modal
  $('card-preview-overlay').style.display = 'flex';
}

function closeCardPreview() {
  $('card-preview-overlay').style.display = 'none';
  $('card-flip-card').classList.remove('flipped');
}

function flipCard() {
  $('card-flip-card').classList.toggle('flipped');
}

// =============================================
// Interaction Modal
// =============================================
function openInteractionModal(contactId) {
  STATE.editingId = contactId;
  iDate.value = new Date().toISOString().split('T')[0];
  iType.value = '電話';
  iNote.value = '';
  interactionModalOverlay.style.display = 'flex';
  setTimeout(() => iNote.focus(), 100);
}

function closeInteractionModal() {
  interactionModalOverlay.style.display = 'none';
}

function saveInteraction() {
  const note = iNote.value.trim();
  if (!note) { iNote.classList.add('error'); return; }
  iNote.classList.remove('error');

  const contact = STATE.contacts.find(c => c.id === STATE.editingId);
  if (!contact) return;

  if (!contact.interactions) contact.interactions = [];
  contact.interactions.push({
    id: genId(),
    date: iDate.value || new Date().toISOString().split('T')[0],
    type: iType.value,
    note,
  });
  contact.updatedAt = Date.now();
  saveContacts();
  closeInteractionModal();
  if (STATE.openContactId === contact.id) renderDetailContent(contact);
  showToast('互動記錄已新增', 'success');
}

function deleteInteraction(contactId, interactionId) {
  const contact = STATE.contacts.find(c => c.id === contactId);
  if (!contact) return;
  contact.interactions = (contact.interactions || []).filter(i => i.id !== interactionId);
  contact.updatedAt = Date.now();
  saveContacts();
  if (STATE.openContactId === contactId) renderDetailContent(contact);
  showToast('已刪除互動記錄', 'info');
}

// =============================================
// Add/Edit Modal
// =============================================
function openAddModal() {
  STATE.editingId = null;
  STATE.editingTags = [];
  modalTitle.textContent = '新增客戶';
  contactForm.reset();
  renderTagChips();
  updateFormAvatar('');
  modalOverlay.style.display = 'flex';
  setTimeout(() => fName.focus(), 100);
}

function openEditModal(contactId) {
  const contact = STATE.contacts.find(c => c.id === contactId);
  if (!contact) return;
  STATE.editingId = contactId;
  STATE.editingTags = [...(contact.tags || [])];
  modalTitle.textContent = '編輯客戶資料';

  fName.value = contact.name || '';
  fTitle.value = contact.title || '';
  fCompany.value = contact.company || '';
  fPhone.value = contact.phone || '';
  fEmail.value = contact.email || '';
  fAddress.value = contact.address || '';
  fWebsite.value = contact.website || '';
  fNotes.value = contact.notes || '';

  renderTagChips();
  updateFormAvatar(contact.name);
  modalOverlay.style.display = 'flex';
  setTimeout(() => fName.focus(), 100);
}

function closeModal() {
  modalOverlay.style.display = 'none';
  STATE.editingId = null;
  STATE.editingTags = [];
}

function saveContact() {
  const name = fName.value.trim();
  if (!name) {
    fName.classList.add('error');
    fName.focus();
    showToast('請輸入客戶姓名', 'error');
    return;
  }
  fName.classList.remove('error');

  const data = {
    name,
    title: fTitle.value.trim(),
    company: fCompany.value.trim(),
    phone: fPhone.value.trim(),
    email: fEmail.value.trim(),
    address: fAddress.value.trim(),
    website: fWebsite.value.trim(),
    tags: [...STATE.editingTags],
    notes: fNotes.value.trim(),
    updatedAt: Date.now(),
  };

  if (STATE.editingId) {
    const idx = STATE.contacts.findIndex(c => c.id === STATE.editingId);
    if (idx !== -1) {
      STATE.contacts[idx] = { ...STATE.contacts[idx], ...data };
    }
    showToast('客戶資料已更新', 'success');
  } else {
    STATE.contacts.unshift({
      id: genId(),
      ...data,
      favorite: false,
      interactions: [],
      createdAt: Date.now(),
    });
    showToast('客戶已新增', 'success');
  }

  saveContacts();
  closeModal();
  render();

  if (STATE.editingId && STATE.openContactId === STATE.editingId) {
    const updated = STATE.contacts.find(c => c.id === STATE.editingId);
    if (updated) renderDetailContent(updated);
  }
}

// =============================================
// Tag Input
// =============================================
function renderTagChips() {
  tagChips.innerHTML = STATE.editingTags.map(tag => `
    <span class="tag-input-chip">
      ${escHtml(tag)}
      <span class="tag-chip-remove" data-tag="${escHtml(tag)}" role="button" aria-label="移除標籤">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </span>
    </span>
  `).join('');

  tagChips.querySelectorAll('.tag-chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.editingTags = STATE.editingTags.filter(t => t !== btn.dataset.tag);
      renderTagChips();
    });
  });
}

function addTag(value) {
  const tag = value.trim();
  if (tag && !STATE.editingTags.includes(tag)) {
    STATE.editingTags.push(tag);
    renderTagChips();
  }
  fTags.value = '';
}

function updateFormAvatar(name) {
  formAvatar.className = `avatar-lg ${name ? getColorClass(name) : 'avatar-color-0'}`;
  formAvatar.textContent = name ? getInitials(name) : '?';
}

// =============================================
// Utilities
// =============================================
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

// =============================================
// Event Listeners
// =============================================
function bindEvents() {
  // Sidebar toggle
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // Search
  searchInput.addEventListener('input', () => {
    STATE.searchQuery = searchInput.value;
    clearSearchBtn.style.display = STATE.searchQuery ? 'flex' : 'none';
    render();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    STATE.searchQuery = '';
    clearSearchBtn.style.display = 'none';
    render();
  });

  // Nav filters
  navAll.addEventListener('click', () => {
    STATE.filter = 'all';
    STATE.activeTag = null;
    render();
  });

  navFavorite.addEventListener('click', () => {
    STATE.filter = 'favorite';
    STATE.activeTag = null;
    render();
  });

  // View mode
  viewGridBtn.addEventListener('click', () => { STATE.viewMode = 'grid'; render(); });
  viewListBtn.addEventListener('click', () => { STATE.viewMode = 'list'; render(); });

  // Add contact buttons
  $('add-contact-btn').addEventListener('click', openAddModal);
  $('add-contact-btn-header').addEventListener('click', openAddModal);
  $('empty-add-btn').addEventListener('click', openAddModal);

  // Modal close/save
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  modalSave.addEventListener('click', saveContact);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

  // Modal form events
  fName.addEventListener('input', () => {
    fName.classList.remove('error');
    updateFormAvatar(fName.value.trim());
  });

  fTags.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(fTags.value); }
    if (e.key === 'Backspace' && !fTags.value && STATE.editingTags.length > 0) {
      STATE.editingTags.pop();
      renderTagChips();
    }
  });

  // Detail panel
  closeDetail.addEventListener('click', closeDetailPanel);
  detailOverlay.addEventListener('click', closeDetailPanel);

  detailFavBtn.addEventListener('click', () => {
    if (STATE.openContactId) toggleFavorite(STATE.openContactId);
  });

  detailEditBtn.addEventListener('click', () => {
    if (STATE.openContactId) {
      closeDetailPanel();
      setTimeout(() => openEditModal(STATE.openContactId), 150);
    }
  });

  detailDeleteBtn.addEventListener('click', () => {
    if (STATE.openContactId) deleteContact(STATE.openContactId);
  });

  // Card Preview button in detail panel
  detailCardPreviewBtn.addEventListener('click', () => {
    if (STATE.openContactId) openCardPreview(STATE.openContactId);
  });

  // Card Preview modal
  $('card-preview-close').addEventListener('click', closeCardPreview);
  $('card-preview-flip-btn').addEventListener('click', flipCard);
  $('card-flip-scene').addEventListener('click', flipCard);
  $('card-preview-overlay').addEventListener('click', e => {
    if (e.target === $('card-preview-overlay')) closeCardPreview();
  });

  // Mobile Bottom Nav
  $('mob-nav-all').addEventListener('click', () => {
    STATE.filter = 'all'; STATE.activeTag = null; render();
    document.querySelectorAll('.mobile-nav-item').forEach(el => el.classList.remove('active'));
    $('mob-nav-all').classList.add('active');
  });
  $('mob-nav-favorite').addEventListener('click', () => {
    STATE.filter = 'favorite'; STATE.activeTag = null; render();
    document.querySelectorAll('.mobile-nav-item').forEach(el => el.classList.remove('active'));
    $('mob-nav-favorite').classList.add('active');
  });
  $('mob-add-btn').addEventListener('click', openAddModal);

  // Mobile search
  $('mob-search-btn').addEventListener('click', () => {
    $('mobile-search-bar').classList.toggle('open');
    if ($('mobile-search-bar').classList.contains('open')) {
      setTimeout(() => $('mobile-search-input').focus(), 300);
    }
  });
  $('mobile-search-close').addEventListener('click', () => {
    $('mobile-search-bar').classList.remove('open');
    $('mobile-search-input').value = '';
    STATE.searchQuery = ''; render();
  });
  $('mobile-search-input').addEventListener('input', () => {
    STATE.searchQuery = $('mobile-search-input').value; render();
  });

  // Mobile drawer
  $('mob-menu-btn').addEventListener('click', () => {
    $('mobile-drawer').classList.add('open');
    $('mobile-drawer-overlay').classList.add('active');
  });
  const closeDrawer = () => {
    $('mobile-drawer').classList.remove('open');
    $('mobile-drawer-overlay').classList.remove('active');
  };
  $('mobile-drawer-close').addEventListener('click', closeDrawer);
  $('mobile-drawer-overlay').addEventListener('click', closeDrawer);

  $('drawer-nav-all').addEventListener('click', () => {
    STATE.filter = 'all'; STATE.activeTag = null; render(); closeDrawer();
    $('mob-nav-all').classList.add('active');
    $('mob-nav-favorite').classList.remove('active');
  });
  $('drawer-nav-favorite').addEventListener('click', () => {
    STATE.filter = 'favorite'; STATE.activeTag = null; render(); closeDrawer();
    $('mob-nav-favorite').classList.add('active');
    $('mob-nav-all').classList.remove('active');
  });

  // Interaction modal
  interactionModalClose.addEventListener('click', closeInteractionModal);
  interactionCancel.addEventListener('click', closeInteractionModal);
  interactionSave.addEventListener('click', saveInteraction);
  interactionModalOverlay.addEventListener('click', e => {
    if (e.target === interactionModalOverlay) closeInteractionModal();
  });

  iNote.addEventListener('input', () => iNote.classList.remove('error'));

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if ($('card-preview-overlay').style.display !== 'none') { closeCardPreview(); return; }
      if (interactionModalOverlay.style.display !== 'none') { closeInteractionModal(); return; }
      if (modalOverlay.style.display !== 'none') { closeModal(); return; }
      if (detailPanel.classList.contains('open')) { closeDetailPanel(); return; }
    }
    // Ctrl+N to add new contact
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openAddModal();
    }
  });
}

// =============================================
// Init
// =============================================
function init() {
  loadContacts();

  // Load sample data if empty
  if (STATE.contacts.length === 0) {
    STATE.contacts = getSampleContacts();
    saveContacts();
  }

  bindEvents();
  render();

  // Register Service Worker (PWA 離線支援)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.log('SW error:', err));
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

