document.addEventListener('DOMContentLoaded', function () {
	const toggle = document.getElementById('menu-toggle');
	const nav = document.querySelector('.nav-links');

	if (!toggle || !nav) return;

	toggle.addEventListener('click', () => {
		nav.classList.toggle('open');
	});

	// Close when clicking a link
	nav.addEventListener('click', (e) => {
		if (e.target.tagName === 'A') nav.classList.remove('open');
	});

	// Close on resize to desktop
	window.addEventListener('resize', () => {
		if (window.innerWidth > 800) nav.classList.remove('open');
	});

		/* Recipe search filter */
		const search = document.getElementById('recipe-search');
		const recipeList = document.getElementById('recipe-list');
		let selectedTag = 'all';

		function filterItems() {
			if (!recipeList) return;
			const q = search ? search.value.trim().toLowerCase() : '';
			const items = recipeList.querySelectorAll('.sample');
			items.forEach(item => {
				const titleEl = item.querySelector('h3');
				const title = (titleEl && titleEl.dataset.title) ? titleEl.dataset.title : (titleEl ? titleEl.textContent.toLowerCase() : '');
				const tags = (item.dataset.tags || '').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
				const matchesText = !q || title.includes(q);
				const matchesTag = (selectedTag === 'all') || tags.includes(selectedTag);
				item.style.display = (matchesText && matchesTag) ? '' : 'none';
			});
		}

		if (search && recipeList) {
			search.addEventListener('input', filterItems);
		}

		// Tag buttons
		const tagButtons = document.querySelectorAll('.tag-btn');
		tagButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				selectedTag = btn.dataset.tag || 'all';
				tagButtons.forEach(b=>b.classList.remove('active'));
				btn.classList.add('active');
				filterItems();
			});
		});

		// Card preview modal
		const modal = document.getElementById('preview-modal');
		const modalImg = document.getElementById('modal-img');
		const modalTitle = document.getElementById('modal-title');
		const modalExcerpt = document.getElementById('modal-excerpt');
		const modalLink = document.getElementById('modal-link');
		const modalBackdrop = document.getElementById('modal-backdrop');
		const modalClose = document.getElementById('modal-close');

		if (recipeList && modal) {
			recipeList.querySelectorAll('.card-link').forEach(link => {
				link.addEventListener('click', (ev) => {
					ev.preventDefault();
					const sample = link.closest('.sample');
					if (!sample) return;
					const img = link.querySelector('img');
					const title = sample.querySelector('h3') ? sample.querySelector('h3').textContent : '';
					const excerptEl = sample.querySelector('.excerpt');
					const excerpt = excerptEl ? excerptEl.textContent : '';
					modalImg.src = img ? img.src : '';
					modalImg.alt = img ? img.alt : '';
					modalTitle.textContent = title;
					modalExcerpt.textContent = excerpt;
					modalLink.href = link.href || '#';
					modal.classList.add('show');
					modal.setAttribute('aria-hidden','false');
				});
			});

			function closeModal() {
				modal.classList.remove('show');
				modal.setAttribute('aria-hidden','true');
			}

			modalClose && modalClose.addEventListener('click', closeModal);
			modalBackdrop && modalBackdrop.addEventListener('click', closeModal);
			window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
		}

		/* Favorites (localStorage) */
		const favKey = 'rr_favorites';
		function loadFavorites(){
			try{return JSON.parse(localStorage.getItem(favKey)||'[]')}catch(e){return []}
		}
		function saveFavorites(list){localStorage.setItem(favKey,JSON.stringify(list))}
		function isFavorited(id){return loadFavorites().includes(id)}
		function setFavButton(btn, id){if(isFavorited(id)) btn.classList.add('favorited'), btn.textContent='♥'; else btn.classList.remove('favorited'), btn.textContent='♡'}
		// initialize fav buttons
		document.querySelectorAll('.fav-btn').forEach(btn=>{
			const id = btn.dataset.id;
			setFavButton(btn,id);
			btn.addEventListener('click', (ev)=>{
				ev.stopPropagation();
				let list = loadFavorites();
				if(list.includes(id)){list=list.filter(x=>x!==id);}else{list.push(id)}
				saveFavorites(list);
				setFavButton(btn,id);
			});
		});

		/* Ratings (localStorage) */
		const rateKey = 'rr_ratings';
		function loadRatings(){try{return JSON.parse(localStorage.getItem(rateKey)||'{}')}catch(e){return {}}}
		function saveRatings(obj){localStorage.setItem(rateKey,JSON.stringify(obj))}
		function renderRatingUI(container, id){
			const ratings = loadRatings();
			const current = ratings[id]||0;
			container.innerHTML='';
			for(let i=1;i<=5;i++){
				const b=document.createElement('button');b.type='button';b.dataset.value=i;b.innerHTML='★';if(i<=current)b.classList.add('active');b.addEventListener('click',()=>{ratings[id]=i;saveRatings(ratings);renderRatingUI(container,id)});
				container.appendChild(b);
			}
		}

		/* Wire rating stars inside modal when opened */
		const ratingContainer = document.createElement('div');ratingContainer.className='rating';
		const modalContent = document.querySelector('.modal-content');
		if(modalContent) modalContent.insertBefore(ratingContainer, modalLink);

		/* Theme toggle */
		const themeToggle = document.getElementById('theme-toggle');
		function loadTheme(){return localStorage.getItem('rr_theme')||'light'}
		function applyTheme(t){if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}localStorage.setItem('rr_theme',t)}
		applyTheme(loadTheme());
		themeToggle && themeToggle.addEventListener('click', ()=>{applyTheme(document.documentElement.classList.contains('dark')?'light':'dark')});

		/* Share / copy link in modal */
		const copyBtn = document.createElement('button');copyBtn.type='button';copyBtn.textContent='Copy link';copyBtn.className='btn';copyBtn.style.marginTop='10px';
		if(modalContent) modalContent.appendChild(copyBtn);
		copyBtn.addEventListener('click', ()=>{
			navigator.clipboard && navigator.clipboard.writeText(modalLink.href).then(()=>alert('Link copied to clipboard'));
		});

		/* ensure rating UI and fav buttons reflect modal item when opened */
		if (recipeList && modal) {
			recipeList.querySelectorAll('.card-link').forEach(link => {
				link.addEventListener('click', (ev) => {
					ev.preventDefault();
					const sample = link.closest('.sample');
					if (!sample) return;
					const id = sample.dataset.id;
					renderRatingUI(ratingContainer, id);
					// ensure fav state on modal (no separate fav UI here)
				});
			});
		}

		/* Back-to-top button */
		const back = document.getElementById('back-to-top');
		if (back) {
			window.addEventListener('scroll', () => {
				if (window.scrollY > 300) back.classList.add('show'); else back.classList.remove('show');
			});
			back.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
		}

		/* Newsletter (non-submitting demo) */
		const newsletter = document.getElementById('newsletter');
		if (newsletter) {
			newsletter.addEventListener('submit', (ev) => {
				ev.preventDefault();
				const email = document.getElementById('newsletter-email').value;
				if (email && email.includes('@')) {
					alert('Thanks! ' + email + ' has been added to the demo list.');
					newsletter.reset();
				} else {
					alert('Please enter a valid email address.');
				}
			});
		}
});
