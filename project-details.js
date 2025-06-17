/**
 * @file Binds data from Supabase to the project-details.html page.
 * @version 4.1.0 (Definitive, Corrected Version)
 * @description Fixes the ReferenceError typo and ensures smooth operation.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const SUPABASE_URL = 'https://qkbbovcclwsohvtupyhe.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYmJvdmNjbHdzb2h2dHVweWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MzMxMDksImV4cCI6MjA2NDMwOTEwOX0.ndE8TOFcf0ZkXPh7SnXnwbAkvySV8dqr_UlT7KG7wXg';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const BREADCRUMB_IMAGE_URL = 'https://webency.themejunction.net/wp-content/uploads/2024/03/breadcrumb_bg-scaled.jpg';
    const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' fill='%23e2e8f0'%3E%3Crect width='800' height='600'/%3E%3C/svg%3E";

    // --- DOM ELEMENT CACHING ---
    const dom = {
        pageTitle: document.querySelector('title'),
        breadcrumbWrapper: document.getElementById('breadcrumb-wrapper'),
        breadcrumbTitle: document.getElementById('breadcrumb-title'),
        mainProjectImage: document.getElementById('main-project-image'),
        projectTitleContainer: document.getElementById('project-title-container'),
        projectDescription: document.getElementById('project-description'),
        problemStatement: document.getElementById('problem-statement'),
        solutionDetailsList: document.getElementById('solution-details-list'),
        solutionImage: document.getElementById('solution-image'),
        resultsText: document.getElementById('results-text'),
        projectInfoContainer: document.getElementById('project-info-container'),
        mediaHandlesContainer: document.getElementById('media-handles-container'),
        viewProjectBtnContainer: document.getElementById('view-project-button-container'),
    };

    // --- DYNAMIC MODAL CREATION ---
    let modalInstance = null;

    const createModal = () => {
        if (modalInstance) return;

        modalInstance = document.createElement('div');
        modalInstance.id = 'project-viewer-modal';
        modalInstance.className = 'modal-overlay';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-button';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        
        const contentWrapper = document.createElement('div');
        contentWrapper.id = 'modal-content-wrapper';
        contentWrapper.className = 'modal-content-wrapper';
        
        modalInstance.appendChild(closeBtn);
        modalInstance.appendChild(contentWrapper);
        document.body.appendChild(modalInstance);
        
        closeBtn.addEventListener('click', () => modalInstance.classList.remove('visible'));
        modalInstance.addEventListener('click', (event) => {
            if (event.target === modalInstance) {
                modalInstance.classList.remove('visible');
            }
        });
    };

    const openProjectModal = (project) => {
        createModal();
        const contentWrapper = modalInstance.querySelector('#modal-content-wrapper');
        contentWrapper.innerHTML = '';

        if (project.is_website_deployed && project.site_url) {
            const iframe = document.createElement('iframe');
            iframe.src = project.site_url;
            contentWrapper.appendChild(iframe);
        } else {
            const image = document.createElement('img');
            image.src = project.project_image_url || PLACEHOLDER_IMAGE;
            image.alt = `Image for ${project.project_name}`;
            contentWrapper.appendChild(image);
        }
        
        modalInstance.classList.add('visible');
    };

    // --- DATA RENDERING FUNCTIONS ---
    const createInfoItem = (title, info) => {
        if (!info) return '';
        return `<div class="info-item"><h5 class="title">${title}:</h5><span class="info">${info}</span></div>`;
    };

    const renderProjectDetails = (project) => {
        dom.breadcrumbWrapper.style.backgroundImage = `url("${BREADCRUMB_IMAGE_URL}")`;
        dom.pageTitle.textContent = `${project.project_name} – SymTech Web`;
        dom.breadcrumbTitle.textContent = project.project_name;
        dom.projectTitleContainer.innerHTML = `<h2 class="title">${project.project_name}</h2>`;
        dom.mainProjectImage.src = project.project_image_url || PLACEHOLDER_IMAGE;
        dom.solutionImage.src = project.solution_image_url || PLACEHOLDER_IMAGE;
        dom.projectDescription.innerHTML = project.solution_details?.replace(/\n/g, '<p></p>') || '<p>No description.</p>';
        dom.problemStatement.innerHTML = project.problem_statement?.replace(/\n/g, '<p></p>') || '<p>No problem statement.</p>';
        dom.resultsText.innerHTML = project.results?.replace(/\n/g, '<p></p>') || '<p>No results provided.</p>';
        
        if (project.solution_details) {
            const solutionItems = project.solution_details.split('\n').filter(i => i.trim()).map(i => `<li><i class="fas fa-check"></i> ${i.trim()}</li>`).join('');
            dom.solutionDetailsList.innerHTML = `<ul class="list dot-style">${solutionItems}</ul>`;
        }
        
        // --- CRITICAL TYPO FIX WAS HERE ---
        let infoHTML = createInfoItem('Client', project.client_name) +
                       createInfoItem('Category', project.project_type) +
                       createInfoItem('Tags', project.tags?.join(', ')) +
                       createInfoItem('Start Date', project.start_date ? new Date(project.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null) +
                       createInfoItem('End Date', project.end_date ? new Date(project.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null); // Fixed 'createInfo-item' to 'createInfoItem'
        dom.projectInfoContainer.innerHTML = infoHTML;
        
        dom.viewProjectBtnContainer.innerHTML = `<button id="view-project-btn" class="elementor-button tj-primary-btn">View Project</button>`;
        document.getElementById('view-project-btn').addEventListener('click', () => openProjectModal(project));

        if (project.media_handles) {
            const handles = project.media_handles.split('\n').filter(h => h.trim()).map(h => {
                let icon = 'fa-link';
                if (h.includes('facebook')) icon = 'fa-facebook-f';
                if (h.includes('instagram')) icon = 'fa-instagram';
                if (h.includes('twitter') || h.includes('x.com')) icon = 'fa-twitter';
                if (h.includes('linkedin')) icon = 'fa-linkedin-in';
                return `<li><a href="${h.trim()}" target="_blank"><i class="fab ${icon}"></i></a></li>`;
            }).join('');
            dom.mediaHandlesContainer.innerHTML = `<ul class="dot-style">${handles}</ul>`;
        }
    };

    // --- MAIN INITIALIZATION LOGIC ---
    const initializePage = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        if (!projectId) {
            dom.breadcrumbTitle.textContent = "Project Not Found";
            dom.projectTitleContainer.innerHTML = `<h2 class="title">No project ID provided.</h2>`;
            return;
        }

        try {
            const { data: project, error } = await supabaseClient.from('projects').select('*').eq('id', projectId).single();
            if (error || !project) throw new Error(error ? error.message : "Project not found.");
            renderProjectDetails(project);
        } catch (err) {
            console.error('Error:', err);
            dom.breadcrumbTitle.textContent = "Error Loading Project";
            dom.projectTitleContainer.innerHTML = `<h2 class="title">Could not find project.</h2>`;
        }
    };

    initializePage();
});