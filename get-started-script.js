document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('multi-step-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form || !submitBtn) return;

  // ✅ Supabase Client
  const supabase = window.supabase.createClient(
    'https://qkbbovcclwsohvtupyhe.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYmJvdmNjbHdzb2h2dHVweWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MzMxMDksImV4cCI6MjA2NDMwOTEwOX0.ndE8TOFcf0ZkXPh7SnXnwbAkvySV8dqr_UlT7KG7wXg'
  );

  // ✅ EmailJS config
  const EMAIL_SERVICE_ID = 'default_service';
  const EMAIL_TEMPLATE_ID = 'template_jih1o2g';
  const EMAIL_PUBLIC_KEY = '2ZatxIsbFksIaJdGL';

  // ✅ Generate Submission ID
  const generateSubmissionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let middle = '';
    for (let i = 0; i < 15; i++) {
      middle += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const suffix = Math.floor(Math.random() * 10);
    return `STW-${middle}-${suffix}`;
  };

  // ✅ Convert object keys to lowercase
  const toLowerKeys = (obj) => {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key.toLowerCase()] = obj[key];
      }
    }
    return result;
  };

  // ✅ Collect and flatten form data
  const collectFormData = () => {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      const cleanKey = key.replace(/\[\]$/, '');
      if (data[cleanKey]) {
        data[cleanKey] = [].concat(data[cleanKey], value);
      } else {
        data[cleanKey] = value;
      }
    });
    return data;
  };

  // ✅ Upload files
  const uploadFiles = async (files) => {
    const urls = [];
    for (const file of files) {
      const path = `uploads/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('form_uploads').upload(path, file);
      if (!error) {
        const { data: publicUrl } = supabase.storage.from('form_uploads').getPublicUrl(path);
        urls.push(publicUrl.publicUrl);
      }
    }
    return urls;
  };

  // ✅ Save bio info only to bio_info table
  const saveBioInfo = async (data) => {
    const bio = {
      submissionid: data.submissionid,
      fullname: data.fullname,
      email: data.email,
      phone: data.phone,
      mediahandle: data.mediahandle || '',
      user_type: window.STW_USER_TYPE,
      service: window.STW_SELECTED_SERVICE
    };
    const { error } = await supabase.from('bio_info').insert([bio]);
    if (error) throw new Error(`Bio insert failed: ${error.message}`);
  };
const saveServiceInfo = async (data, fileLinks) => {
  // Normalize keys to lowercase
  let payload = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      payload[key.toLowerCase()] = data[key];
    }
  }

  // Remove bio fields
  const removeFields = [
    'fullname', 'email', 'phone', 'mediahandle',
    'user_type', 'service', '_template', '_subject', 'user_nickname'
  ];
  removeFields.forEach(field => delete payload[field]);

  // Clean values
  for (const key in payload) {
    if (Array.isArray(payload[key])) {
      payload[key] = payload[key].join(', ');
    }

    // ✅ Convert empty strings to null
    if (payload[key] === '') {
      payload[key] = null;
    }

    // ✅ Convert string numbers to integers if they are numeric fields
    const intFields = ['wordpagecount', 'pptslidecount', 'pagecount', 'productcount', 'dimensionwidth', 'dimensionheight'];
    if (intFields.includes(key) && payload[key] !== null) {
      const parsed = parseInt(payload[key], 10);
      payload[key] = isNaN(parsed) ? null : parsed;
    }
  }

  // Add uploaded files
  if (fileLinks?.length) {
    payload.uploaded_files = fileLinks.join(', ');
  }

  // Insert into Supabase
  const table = `${window.STW_SELECTED_SERVICE.replace(/-/g, '_')}_requests`;
  const { error } = await supabase.from(table).insert([payload]);
  if (error) throw new Error(`Service insert failed: ${error.message}`);
};


  // ✅ FormSubmit - admin notification
  const sendFormSubmit = async (data, fileLinks) => {
    const body = {
      ...toLowerKeys(data),
      uploaded_file_links: fileLinks.join('\n'),
      _subject: `New ${window.STW_SELECTED_SERVICE} Request`,
      _template: 'box'
    };

    const res = await fetch('https://formsubmit.co/ajax/symtechweb@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`FormSubmit failed: ${res.statusText}`);
  };

const sendEmailJS = async (data) => {
  const payload = {
    fullName: data.fullname || "Customer",                  // ⬅️ Template expects fullName (camelCase)
    submission_id: data.submissionid,                       // ⬅️ Template expects submission_id (underscore)
    selectedService: window.STW_SELECTED_SERVICE            // ⬅️ Template expects selectedService
  };

  if (!data.email) throw new Error("EmailJS failed: email is missing");

  await emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, {
  to_name: data.fullname,
  to_email: data.email,
  selectedService: window.STW_SELECTED_SERVICE,
  submission_id: data.submissionid
}, EMAIL_PUBLIC_KEY);

};


  // ✅ Handle form submission
  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const data = collectFormData();
      data.submissionid = generateSubmissionId();
      // 🔐 Save user info to localStorage for booking.js
localStorage.setItem("stw_user_name", data.fullname || "Guest");
localStorage.setItem("stw_user_email", data.email || "");
localStorage.setItem("stw_user_phone", data.phone || "");
localStorage.setItem("stw_user_mediahandle", data.mediahandle || "");
localStorage.setItem("stw_user_type", window.STW_USER_TYPE || "");
localStorage.setItem("stw_user_service", window.STW_SELECTED_SERVICE || "");
localStorage.setItem("stw_submission_id", data.submissionid);

console.log("📦 Saved to localStorage:", {
name: data.fullName || data.fullname || "Guest",
  email: data.email,
  phone: data.phone,
  service: window.STW_SELECTED_SERVICE
});


      const files = [...form.querySelectorAll('input[type="file"]')].flatMap(i => [...i.files]);
      const fileLinks = await uploadFiles(files);

      await saveBioInfo(toLowerKeys(data));
      await saveServiceInfo(data, fileLinks);
      await sendFormSubmit(data, fileLinks);
      await sendEmailJS(toLowerKeys(data));

      document.querySelector('[data-main-step="3"]').style.display = 'none';
      document.querySelector('[data-main-step="4"]').style.display = 'block';

    } catch (err) {
      alert(`Submission failed: ${err.message}`);
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });
});
