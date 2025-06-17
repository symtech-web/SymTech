document.addEventListener('DOMContentLoaded', () => {
  // --- CLIENT-SIDE KEYS ---
  const supabaseUrl = 'https://qkbbovcclwsohvtupyhe.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYmJvdmNjbHdzb2h2dHVweWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MzMxMDksImV4cCI6MjA2NDMwOTEwOX0.ndE8TOFcf0ZkXPh7SnXnwbAkvySV8dqr_UlT7KG7wXg';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  emailjs.init('ikmSSytUQ6Efb-K7p');

  // --- MODAL & FORM ELEMENTS (Unchanged) ---
  const openModalBtn = document.getElementById('openRegisterModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const registerModal = document.getElementById('registerModal');
  const selectionScreen = document.getElementById('selectionScreen');
  const individualFormContainer = document.getElementById('individualFormContainer');
  const companyFormContainer = document.getElementById('companyFormContainer');
  const showIndividualFormBtn = document.getElementById('showIndividualFormBtn');
  const showCompanyFormBtn = document.getElementById('showCompanyFormBtn');
  const backBtns = document.querySelectorAll('.back-btn');
  const individualForm = document.getElementById('individualForm');
  const companyForm = document.getElementById('companyForm');
  const emailInput = document.getElementById('email');

  // --- MODAL & FORM SWITCHING LOGIC (Unchanged) ---
  const openModal = () => { registerModal.classList.add('show'); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { registerModal.classList.remove('show'); document.body.style.overflow = ''; setTimeout(() => { individualFormContainer.style.display = 'none'; companyFormContainer.style.display = 'none'; selectionScreen.style.display = 'block'; }, 300); };
  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  registerModal.addEventListener('click', (e) => { if (e.target === registerModal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && registerModal.classList.contains('show')) closeModal(); });
  const showForm = (formToShow) => { selectionScreen.style.display = 'none'; formToShow.style.display = 'block'; };
  showIndividualFormBtn.addEventListener('click', () => showForm(individualFormContainer));
  showCompanyFormBtn.addEventListener('click', () => showForm(companyFormContainer));
  backBtns.forEach(btn => { btn.addEventListener('click', () => { individualFormContainer.style.display = 'none'; companyFormContainer.style.display = 'none'; selectionScreen.style.display = 'block'; }); });

  // --- HELPER FUNCTIONS ---
  const showError = (input, message) => { const errorDiv = input.parentElement.querySelector('.form-error'); input.classList.add('is-invalid'); errorDiv.textContent = message; errorDiv.style.display = 'block'; };
  const clearErrors = (form) => { form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid')); form.querySelectorAll('.form-error').forEach(el => el.style.display = 'none'); };
  const checkEmailExists = async (email) => {
    const { data, error } = await supabase.from('employees').select('email').eq('email', email).limit(1);
    if (error) { console.error("Error checking email:", error); return false; }
    return data && data.length > 0;
  };
  const sendAdminNotification = async (data) => {
    const emailPayload = { _subject: `New Family Registration: ${data.full_name}`, _template: "table", ...data };
    emailPayload.skills = data.skills.join(', ');
    try {
      const response = await fetch('https://formsubmit.co/ajax/symtechweb@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(emailPayload) });
      if (!response.ok) throw new Error('FormSubmit response was not OK.');
    } catch (error) {
      console.warn('Could not send admin notification via FormSubmit:', error.message);
    }
  };

  // ✅ FIXED: Updated to use the correct template and send the employee ID
  const sendWelcomeEmail = async (userData) => {
      const serviceID = 'default_service';
      const templateID = 'template_js61vvg'; // The template ID you provided
      
      const templateParams = {
          // This parameter name must EXACTLY match the placeholder in your template
          SUBMISSION_ID: userData.employee_id, 
          // EmailJS uses this to know who to send the email to
          to_email: userData.email,
          to_name: userData.full_name
      };

      try {
          await emailjs.send(serviceID, templateID, templateParams);
          console.log('Welcome email sent successfully to the user.');
      } catch (error) {
          // This error won't stop the user's flow, but it's important for debugging.
          console.warn('Could not send welcome email to user:', error);
      }
  };
  
  // --- INDIVIDUAL FORM LOGIC ---
  individualForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = individualForm.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    // Validation logic...
    let isValid = true;
    clearErrors(individualForm);
    const requiredFields = ['fullName', 'email', 'phone', 'role', 'department', 'skills', 'address', 'dob', 'dateHired', 'employmentType', 'status'];
    requiredFields.forEach(id => { const input = document.getElementById(id); if (input.value.trim() === '') { showError(input, 'This field is required.'); isValid = false; }});
    if (emailInput.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) { showError(emailInput, 'Please enter a valid email address.'); isValid = false; }
    const fileInput = document.getElementById('profileImage');
    if (fileInput.files.length === 0) { showError(fileInput, 'A profile picture is required.'); isValid = false; }
    const dobInput = document.getElementById('dob');
    if (dobInput.value) { const birthDate = new Date(dobInput.value); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } if (age < 16) { showError(dobInput, 'You must be at least 16 years old to join.'); isValid = false; }}
    if (!isValid) { submitBtn.disabled = false; submitBtn.classList.remove('loading'); return; }

    const emailExists = await checkEmailExists(emailInput.value);
    if (emailExists) { showError(emailInput, 'This email address is already registered.'); submitBtn.disabled = false; submitBtn.classList.remove('loading'); return; }

    // Submission Logic
    try {
      const originalFile = fileInput.files[0];
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressedFile = await imageCompression(originalFile, options);
      const fullName = document.getElementById('fullName').value;
      const randomTenDigitNumber = Math.floor(1000000000 + Math.random() * 9000000000);
      const employeeId = `STW-${randomTenDigitNumber}-${new Date().getFullYear().toString().slice(-2)}`;
      const fileName = `${employeeId}-${compressedFile.name.replace(/\s+/g, '-')}`;
      const bucketName = 'portal_uploads';
      const filePath = `public/avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, compressedFile);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      const formData = new FormData(individualForm);
      const employeeData = {
        employee_id: employeeId,
        full_name: fullName,
        email: formData.get('email'),
        phone: formData.get('phone'),
        role: formData.get('role'),
        department: formData.get('department'),
        profile_image_url: urlData.publicUrl,
        skills: formData.get('skills').split(',').map(s => s.trim()),
        address: formData.get('address'),
        date_of_birth: formData.get('dob'),
        date_hired: formData.get('dateHired'),
        employment_type: formData.get('employmentType'),
        status: formData.get('status'),
      };
      const { error: insertError } = await supabase.from('employees').insert([employeeData]);
      if (insertError) throw insertError;
      
      alert(`Welcome to the family, ${fullName}! Your registration is complete.`);
      
      await sendAdminNotification(employeeData);
      await sendWelcomeEmail(employeeData);

      individualForm.reset();
      closeModal();
    } catch (error) {
      console.error('Registration Error:', error);
      alert(`An unexpected error occurred: ${error.message}. Please try again.`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });

  // --- COMPANY FORM LOGIC (Unchanged) ---
  const validateCompanyForm = () => {
    let isValid = true;
    clearErrors(companyForm);
    const requiredFields = ['companyName', 'contactPerson', 'companyEmail', 'website', 'businessType', 'proposal'];
    requiredFields.forEach(id => { const input = document.getElementById(id); if (input.value.trim() === '') { showError(input, 'This field is required.'); isValid = false; }});
    const companyEmailInput = document.getElementById('companyEmail');
    if (companyEmailInput.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmailInput.value)) { showError(companyEmailInput, 'Please enter a valid email address.'); isValid = false; }
    return isValid;
  };
  companyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateCompanyForm()) return;
    const submitBtn = companyForm.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    const partnershipData = { company_name: document.getElementById('companyName').value, contact_person: document.getElementById('contactPerson').value, email: document.getElementById('companyEmail').value, website_url: document.getElementById('website').value, business_type: document.getElementById('businessType').value, proposal_message: document.getElementById('proposal').value, };
    try {
      const { error } = await supabase.from('partnerships').insert([partnershipData]);
      if (error) { throw error; }
      alert('Thank you! Your partnership proposal has been submitted to our system. We will be in touch soon.');
      companyForm.reset();
      closeModal();
    } catch (error) {
      console.error('Partnership Submission Error:', error);
      alert(`Failed to submit proposal: ${error.message}. Please try again later.`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });
});