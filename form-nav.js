document.addEventListener('DOMContentLoaded', () => {
  window.STW_USER_TYPE = null;
  window.STW_SELECTED_SERVICE = null;

  const stepContainers = document.querySelectorAll('.step-container');
  const serviceStepsContainer = document.getElementById('service-specific-steps-container');
  const formTemplates = document.getElementById('form-templates');
  const formTitle = document.getElementById('form-title');
  const progressBar = document.getElementById('form-progress-bar');

  const backBtn = document.getElementById('back-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const startIndividualBtn = document.getElementById('start-individual');
  const startCompanyBtn = document.getElementById('start-company');
  const serviceGrid = document.querySelector('.service-grid');

  const getAllSteps = () =>
    Array.from(serviceStepsContainer.querySelectorAll('.form-sub-step'));

  const updateFormDisplay = () => {
    const steps = getAllSteps();
    const active = serviceStepsContainer.querySelector('.form-sub-step.active');
    const currentIndex = steps.indexOf(active);
    if (!active) return;

    backBtn.style.display = currentIndex > 0 ? 'inline-block' : 'none';
    nextBtn.style.display = currentIndex < steps.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = currentIndex === steps.length - 1 ? 'inline-block' : 'none';

    progressBar.innerHTML = '';
    steps.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'progress-dot';
      if (i <= currentIndex) dot.classList.add('active');
      progressBar.appendChild(dot);
    });
  };

  const showMainStep = (num) => {
    stepContainers.forEach(c => c.style.display = 'none');
    const target = document.querySelector(`.step-container[data-main-step="${num}"]`);
    if (target) target.style.display = 'block';
  };

  const showServiceSubStep = (stepNumber) => {
    const steps = getAllSteps();
    steps.forEach(step => {
      step.style.display = 'none';
      step.classList.remove('active');
    });
    const target = serviceStepsContainer.querySelector(`.form-sub-step[data-sub-step="${stepNumber}"]`);
    if (target) {
      target.style.display = 'block';
      target.classList.add('active');
    }
    updateFormDisplay();
  };

  const validateCurrentStep = () => {
    let valid = true;
    const step = serviceStepsContainer.querySelector('.form-sub-step.active');
    const inputs = step.querySelectorAll('[required]');

    step.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    step.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    inputs.forEach(input => {
      const isVisible = input.offsetParent !== null;
      const isFilled = input.type === 'checkbox' || input.type === 'radio'
        ? step.querySelector(`input[name="${input.name}"]:checked`)
        : input.value.trim() !== '';

      if (isVisible && !isFilled) {
        input.classList.add('error');
        const err = input.closest('.form-group')?.querySelector('.error-message');
        if (err) err.textContent = 'This field is required.';
        valid = false;
      }
    });

    return valid;
  };

  const resetAndLoadForm = () => {
    const serviceName = window.STW_SELECTED_SERVICE.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    formTitle.textContent = `${serviceName} Request`;

    serviceStepsContainer.innerHTML = '';

    const serviceWrapper = formTemplates.content.querySelector(`[data-service-form="${window.STW_SELECTED_SERVICE}"]`).cloneNode(true);
    serviceWrapper.classList.add('service-form-wrapper');

    const bioStep = formTemplates.content.querySelector('#bio-info-step-template .form-sub-step').cloneNode(true);
    serviceWrapper.insertBefore(bioStep, serviceWrapper.firstChild);

    serviceStepsContainer.appendChild(serviceWrapper);

    serviceStepsContainer.querySelectorAll('.form-sub-step').forEach((step, i) => {
      step.style.display = i === 0 ? 'block' : 'none';
      step.classList.toggle('active', i === 0);
    });

    updateFormDisplay();
    initConditionalFieldLogic();
    initMediaHandleLogic();
  };

  const initConditionalFieldLogic = () => {
    const triggers = serviceStepsContainer.querySelectorAll('[data-condition-trigger]');
    triggers.forEach(trigger => {
      const triggerName = trigger.getAttribute('data-condition-trigger');
      const handleChange = () => {
        const selectedValue = (trigger.type === 'radio')
          ? serviceStepsContainer.querySelector(`input[name="${trigger.name}"]:checked`)?.value
          : trigger.value || '';

        const conditionals = serviceStepsContainer.querySelectorAll(`[data-condition-target="${triggerName}"]`);
        conditionals.forEach(field => {
          const expected = field.getAttribute('data-condition-value');
          const show = selectedValue === expected;
          field.style.display = show ? 'block' : 'none';

          if (!show) {
            const inputs = field.querySelectorAll('input, select, textarea');
            inputs.forEach(i => {
              if (i.type === 'radio' || i.type === 'checkbox') i.checked = false;
              else i.value = '';
            });
          }
        });
      };

      if (trigger.type === 'radio') {
        const radios = serviceStepsContainer.querySelectorAll(`input[name="${trigger.name}"]`);
        radios.forEach(r => r.addEventListener('change', handleChange));
      } else {
        trigger.addEventListener('change', handleChange);
      }

      handleChange(); // Run on load
    });
  };

  const initMediaHandleLogic = () => {
    const icons = serviceStepsContainer.querySelectorAll('.media-icons i');
    const input = serviceStepsContainer.querySelector('#mediaHandle');
    const hint = serviceStepsContainer.querySelector('#socialMediaHint');

    if (!icons || !input || !hint) return;

    icons.forEach(icon => {
      icon.addEventListener('click', () => {
        const platform = icon.dataset.media;
        icons.forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');

        input.style.display = 'block';
        input.placeholder = `Enter your ${platform} handle`;
        hint.style.display = 'block';
        input.name = 'mediahandle';
      });
    });
  };

  nextBtn.addEventListener('click', () => {
    if (!validateCurrentStep()) return;

    const steps = getAllSteps();
    const current = serviceStepsContainer.querySelector('.form-sub-step.active');
    const index = steps.indexOf(current);

    if (index < steps.length - 1) {
      showServiceSubStep(steps[index + 1].dataset.subStep);
    }
  });

  backBtn.addEventListener('click', () => {
    const steps = getAllSteps();
    const current = serviceStepsContainer.querySelector('.form-sub-step.active');
    const index = steps.indexOf(current);

    if (index > 0) {
      showServiceSubStep(steps[index - 1].dataset.subStep);
    }
  });

  startIndividualBtn.addEventListener('click', () => {
    window.STW_USER_TYPE = 'Individual';
    showMainStep(2);
  });

  startCompanyBtn.addEventListener('click', () => {
    window.STW_USER_TYPE = 'Company/Business';
    showMainStep(2);
  });

  serviceGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.service-card');
    if (card) {
      window.STW_SELECTED_SERVICE = card.dataset.service;
      showMainStep(3);
      resetAndLoadForm();
    }
  });

  showMainStep(1);
});
