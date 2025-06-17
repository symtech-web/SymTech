document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll("#footerContactForm, #footerContactForm2");

  const toastContainer = document.createElement("div");
  toastContainer.id = "symtech-toast";
  document.body.appendChild(toastContainer);

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast-message ${type}`;
    toast.innerHTML = `<strong>Symtech Web</strong><br>${message}`;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(form);

      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      })
       .then(response => {
  if (response.ok) {
    showToast("✅ Thank you for reaching out to Symtech Web. Your message has been received successfully. Our team will review your inquiry and respond to you as soon as possible.");
    form.reset();
  } else {
    showToast("❌ We apologize, but there was an issue processing your request. Please try again later or contact us directly through the information provided on our website.", "error");
  }
})
.catch(() => {
  showToast("❌ We regret to inform you that your message could not be sent due to a connection issue. Please ensure you have a stable internet connection and try again. If the problem persists, contact us via phone or email.", "error");
});

    });
  });
});
