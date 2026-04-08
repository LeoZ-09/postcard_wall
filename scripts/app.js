(function() {
  let currentPage = 'wall';
  let currentPlatformFilter = '';
  let selectedFrontImageId = null;
  let selectedBackImageId = null;
  let editingId = null;
  let allImages = [];
  let platformTypes = new Set();

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function init() {
    setupNavigation();
    setupPostcardForm();
    setupImageUpload();
    setupRulesPage();
    loadWallData();
    loadPlatformFilter();
  }

  function setupNavigation() {
    $$('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        switchPage(page);
      });
    });
  }

  function switchPage(page) {
    currentPage = page;
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    $$(`.nav-btn[data-page="${page}"]`).forEach(b => b.classList.add('active'));
    $$('.page').forEach(p => p.classList.remove('active'));
    $(`#${page}-page`).classList.add('active');

    if (page === 'wall') loadWallData();
    if (page === 'manage') loadManageData();
    if (page === 'rules') loadRulesData();
  }

  async function loadWallData() {
    $('#loading').classList.remove('hidden');
    $('#empty-state').classList.add('hidden');
    $('#postcard-grid').innerHTML = '';

    try {
      const [postcardsRes, statsRes] = await Promise.all([
        api.getPostcards(1, 50, currentPlatformFilter),
        api.getStats()
      ]);

      $('#total-count').textContent = statsRes.data.total;
      $('#traveling-count').textContent = statsRes.data.traveling;

      if (postcardsRes.data.items.length === 0) {
        $('#empty-state').classList.remove('hidden');
      } else {
        postcardsRes.data.items.forEach(p => renderPostcardCard(p));
      }
    } catch (err) {
      console.error('Load wall data error:', err);
    } finally {
      $('#loading').classList.add('hidden');
    }
  }

  function renderPostcardCard(postcard) {
    const card = document.createElement('div');
    card.className = 'postcard-card';
    card.dataset.id = postcard.id;

    const frontHtml = postcard.front_image
      ? `<div class="card-image"><img src="${postcard.front_image.url}" alt="正面" loading="lazy"></div>`
      : `<div class="card-placeholder">📷</div>`;
    const backHtml = postcard.back_image
      ? `<div class="card-image"><img src="${postcard.back_image.url}" alt="背面" loading="lazy"></div>`
      : `<div class="card-placeholder">📄</div>`;

    card.innerHTML = `
      <div class="card-images">${frontHtml}${backHtml}</div>
      <div class="card-info">
        <div class="card-code">${postcard.postcard_code || '无编码'}</div>
        <div class="card-meta">
          <span>${postcard.send_date || '-'}</span>
          ${postcard.platform_type ? `<span class="card-platform">${postcard.platform_type}</span>` : ''}
        </div>
      </div>
    `;

    card.addEventListener('click', () => showPostcardDetail(postcard.id));
    $('#postcard-grid').appendChild(card);
  }

  async function showPostcardDetail(id) {
    const res = await api.getPostcard(id);
    if (!res.success) return;

    const p = res.data;
    $('#detail-front').src = p.front_image ? p.front_image.url : '';
    $('#detail-back').src = p.back_image ? p.back_image.url : '';
    $('#detail-code').textContent = p.postcard_code || '-';
    $('#detail-platform').textContent = p.platform_type || '-';
    $('#detail-send-date').textContent = p.send_date || '-';
    $('#detail-receive-date').textContent = p.receive_date || '-';
    $('#detail-travel-days').textContent = p.travel_days ? `${p.travel_days} 天` : '-';
    $('#detail-description').textContent = p.description || '-';
    $('#detail-created').textContent = p.created_at ? new Date(p.created_at).toLocaleString('zh-CN') : '-';

    $('#postcard-modal').classList.remove('hidden');
    $('#postcard-modal .modal-close').onclick = () => $('#postcard-modal').classList.add('hidden');
    $('#postcard-modal').onclick = (e) => {
      if (e.target.id === 'postcard-modal') $('#postcard-modal').classList.add('hidden');
    };
  }

  async function loadPlatformFilter() {
    const res = await api.getRules();
    if (!res.success) return;

    const filter = $('#platform-filter');
    platformTypes.clear();
    res.data.forEach(r => {
      if (!platformTypes.has(r.platform_type)) {
        platformTypes.add(r.platform_type);
        const opt = document.createElement('option');
        opt.value = r.platform_type;
        opt.textContent = r.platform_type;
        filter.appendChild(opt);
      }
    });

    filter.onchange = () => {
      currentPlatformFilter = filter.value;
      loadWallData();
    };
  }

  async function loadManageData() {
    const res = await api.getPostcards(1, 100);
    if (!res.success) return;

    const list = $('#manage-list');
    list.innerHTML = '';

    res.data.items.forEach(p => {
      const card = document.createElement('div');
      card.className = 'manage-card';
      card.innerHTML = `
        <img src="${p.front_image ? p.front_image.url : '/styles/placeholder.png'}" alt="正面">
        <div class="manage-card-info">
          <div>${p.postcard_code || '无编码'}</div>
          <div>${p.send_date || '-'}</div>
        </div>
        <div class="manage-card-actions">
          <button class="edit-btn" data-id="${p.id}">编辑</button>
          <button class="delete-btn" data-id="${p.id}">删除</button>
        </div>
      `;
      list.appendChild(card);
    });

    $$('.manage-card .edit-btn').forEach(btn => {
      btn.onclick = () => editPostcard(btn.dataset.id);
    });
    $$('.manage-card .delete-btn').forEach(btn => {
      btn.onclick = () => deletePostcard(btn.dataset.id);
    });
  }

  function setupPostcardForm() {
    const form = $('#postcard-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      await submitPostcard();
    };

    $('#cancel-btn').onclick = () => resetForm();

    $('#send-date').onchange = calculateTravelDays;
    $('#receive-date').onchange = calculateTravelDays;

    $('#postcard-code').oninput = debounce(async (e) => {
      const code = e.target.value;
      if (code.length > 3) {
        const platform = await recognizePlatform(code);
        $('#platform-type').value = platform || '';
        $('#platform-hint').textContent = platform ? `识别平台: ${platform}` : '';
      } else {
        $('#platform-type').value = '';
        $('#platform-hint').textContent = '';
      }
    }, 300);

    $('#select-front-btn').onclick = () => showImageSelector('front');
    $('#select-back-btn').onclick = () => showImageSelector('back');
    $('#close-image-select').onclick = () => $('#image-select-modal').classList.add('hidden');
  }

  function calculateTravelDays() {
    const send = $('#send-date').value;
    const receive = $('#receive-date').value;
    if (send && receive) {
      const days = Math.ceil((new Date(receive) - new Date(send)) / (1000 * 60 * 60 * 24));
      $('#travel-days').value = days > 0 ? `${days} 天` : '';
    }
  }

  async function recognizePlatform(code) {
    const rules = await api.getRules();
    if (!rules.success) return null;

    for (const rule of rules.data.sort((a, b) => b.priority - a.priority)) {
      try {
        const regex = new RegExp(rule.pattern);
        if (regex.test(code)) return rule.platform_type;
      } catch (e) {}
    }
    return null;
  }

  function setupImageUpload() {
    ['front', 'back'].forEach(type => {
      const area = $(`#${type}-upload-area`);
      const input = $(`#${type}-input`);

      area.onclick = () => input.click();
      area.ondragover = (e) => { e.preventDefault(); area.style.borderColor = 'var(--primary)'; };
      area.ondragleave = () => { area.style.borderColor = ''; };
      area.ondrop = async (e) => {
        e.preventDefault();
        area.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          await handleImageFile(file, type);
        }
      };

      input.onchange = async () => {
        if (input.files[0]) {
          await handleImageFile(input.files[0], type);
        }
      };

      $(`.remove-btn[data-target="${type}"]`).onclick = (e) => {
        e.stopPropagation();
        removeImage(type);
      };
    });
  }

  async function handleImageFile(file, type) {
    const preview = $(`#${type}-preview`);
    const placeholder = $(`#${type}-upload-area .upload-placeholder`);
    const previewContainer = $(`#${type}-upload-area .image-preview`);

    preview.src = URL.createObjectURL(file);
    placeholder.classList.add('hidden');
    previewContainer.classList.remove('hidden');

    const res = await api.uploadImage(file);
    if (res.success) {
      if (type === 'front') selectedFrontImageId = res.data.id;
      else selectedBackImageId = res.data.id;
    }
  }

  function removeImage(type) {
    const placeholder = $(`#${type}-upload-area .upload-placeholder`);
    const previewContainer = $(`#${type}-upload-area .image-preview`);
    const input = $(`#${type}-input`);

    placeholder.classList.remove('hidden');
    previewContainer.classList.add('hidden');
    input.value = '';

    if (type === 'front') selectedFrontImageId = null;
    else selectedBackImageId = null;
  }

  async function showImageSelector(target) {
    const res = await api.getImages();
    if (!res.success) return;

    allImages = res.data;
    const grid = $('#image-selector-grid');
    grid.innerHTML = '';

    allImages.forEach(img => {
      const item = document.createElement('div');
      item.className = 'image-selector-item';
      item.dataset.id = img.id;
      item.innerHTML = `<img src="${img.url}" alt="${img.original_name}">`;
      item.onclick = () => selectImageFromSelector(img, target);
      grid.appendChild(item);
    });

    $('#image-select-modal').classList.remove('hidden');
    $('#image-select-modal').dataset.target = target;
  }

  function selectImageFromSelector(image, target) {
    const preview = $(`#${target}-preview`);
    const placeholder = $(`#${target}-upload-area .upload-placeholder`);
    const previewContainer = $(`#${target}-upload-area .image-preview`);

    preview.src = image.url;
    placeholder.classList.add('hidden');
    previewContainer.classList.remove('hidden');

    if (target === 'front') selectedFrontImageId = image.id;
    else selectedBackImageId = image.id;

    $('#image-select-modal').classList.add('hidden');
  }

  async function submitPostcard() {
    const formData = new FormData();
    formData.append('send_date', $('#send-date').value);
    formData.append('receive_date', $('#receive-date').value || '');
    formData.append('postcard_code', $('#postcard-code').value || '');
    formData.append('description', $('#description').value || '');

    if (selectedFrontImageId) formData.append('front_image_id', selectedFrontImageId);
    if (selectedBackImageId) formData.append('back_image_id', selectedBackImageId);

    const frontInput = $('#front-input');
    const backInput = $('#back-input');
    if (frontInput.files[0]) formData.append('front_image', frontInput.files[0]);
    if (backInput.files[0]) formData.append('back_image', backInput.files[0]);

    let res;
    if (editingId) {
      res = await api.updatePostcard(editingId, formData);
    } else {
      res = await api.createPostcard(formData);
    }

    if (res.success) {
      resetForm();
      loadManageData();
      if (currentPage === 'wall') loadWallData();
    } else {
      alert('操作失败: ' + res.message);
    }
  }

  async function editPostcard(id) {
    const res = await api.getPostcard(id);
    if (!res.success) return;

    const p = res.data;
    editingId = id;
    $('#form-title').textContent = '编辑明信片';
    $('#submit-btn').textContent = '更新明信片';
    $('#cancel-btn').classList.remove('hidden');
    $('#edit-id').value = id;

    $('#send-date').value = p.send_date || '';
    $('#receive-date').value = p.receive_date || '';
    $('#postcard-code').value = p.postcard_code || '';
    $('#description').value = p.description || '';
    calculateTravelDays();

    if (p.front_image) {
      selectedFrontImageId = p.front_image.id;
      $('#front-preview').src = p.front_image.url;
      $('#front-upload-area .upload-placeholder').classList.add('hidden');
      $('#front-upload-area .image-preview').classList.remove('hidden');
    }

    if (p.back_image) {
      selectedBackImageId = p.back_image.id;
      $('#back-preview').src = p.back_image.url;
      $('#back-upload-area .upload-placeholder').classList.add('hidden');
      $('#back-upload-area .image-preview').classList.remove('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deletePostcard(id) {
    if (!confirm('确定要删除这张明信片吗？')) return;

    const res = await api.deletePostcard(id);
    if (res.success) {
      loadManageData();
      if (currentPage === 'wall') loadWallData();
    } else {
      alert('删除失败');
    }
  }

  function resetForm() {
    editingId = null;
    $('#form-title').textContent = '添加明信片';
    $('#submit-btn').textContent = '添加明信片';
    $('#cancel-btn').classList.add('hidden');
    $('#postcard-form').reset();
    $('#travel-days').value = '';
    $('#platform-type').value = '';
    $('#platform-hint').textContent = '';
    selectedFrontImageId = null;
    selectedBackImageId = null;
    $$('.upload-placeholder').forEach(p => p.classList.remove('hidden'));
    $$('.image-preview').forEach(p => p.classList.add('hidden'));
    $$('input[type="file"]').forEach(i => i.value = '');
  }

  function setupRulesPage() {
    $('#add-rule-btn').onclick = () => showRuleModal();
    $('#rule-form').onsubmit = async (e) => {
      e.preventDefault();
      await submitRule();
    };
    $('#rule-cancel-btn').onclick = () => $('#rule-form-modal').classList.add('hidden');
  }

  async function loadRulesData() {
    const res = await api.getRules();
    if (!res.success) return;

    const list = $('#rules-list');
    list.innerHTML = '';

    res.data.forEach(rule => {
      const card = document.createElement('div');
      card.className = 'rule-card';
      card.innerHTML = `
        <div class="rule-info">
          <h4>${rule.name} ${rule.is_active ? '' : '(已禁用)'}</h4>
          <p><span class="rule-pattern">${escapeHtml(rule.pattern)}</span></p>
          <p>平台: ${rule.platform_type} | 优先级: ${rule.priority}</p>
          ${rule.description ? `<p>${escapeHtml(rule.description)}</p>` : ''}
        </div>
        <div class="rule-actions">
          <button class="btn btn-small" onclick="editRule(${rule.id})">编辑</button>
          <button class="btn btn-small btn-danger" onclick="deleteRule(${rule.id})">删除</button>
        </div>
      `;
      list.appendChild(card);
    });
  }

  function showRuleModal(rule = null) {
    $('#rule-edit-id').value = rule ? rule.id : '';
    $('#rule-modal-title').textContent = rule ? '编辑规则' : '添加规则';
    $('#rule-name').value = rule ? rule.name : '';
    $('#rule-pattern').value = rule ? rule.pattern : '';
    $('#rule-platform').value = rule ? rule.platform_type : '';
    $('#rule-priority').value = rule ? rule.priority : 0;
    $('#rule-description').value = rule ? rule.description : '';
    $('#rule-form-modal').classList.remove('hidden');
  }

  window.editRule = async function(id) {
    const res = await api.getRules();
    if (!res.success) return;
    const rule = res.data.find(r => r.id === id);
    if (rule) showRuleModal(rule);
  };

  window.deleteRule = async function(id) {
    if (!confirm('确定要删除这条规则吗？')) return;
    const res = await api.deleteRule(id);
    if (res.success) loadRulesData();
  };

  async function submitRule() {
    const data = {
      name: $('#rule-name').value,
      pattern: $('#rule-pattern').value,
      platform_type: $('#rule-platform').value,
      priority: parseInt($('#rule-priority').value) || 0,
      description: $('#rule-description').value
    };

    const editId = $('#rule-edit-id').value;
    let res;
    if (editId) {
      res = await api.updateRule(parseInt(editId), data);
    } else {
      res = await api.createRule(data);
    }

    if (res.success) {
      $('#rule-form-modal').classList.add('hidden');
      loadRulesData();
      loadPlatformFilter();
    } else {
      alert('保存失败: ' + res.message);
    }
  }

  function debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', init);
})();