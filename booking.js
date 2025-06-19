if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(
    'https://qkbbovcclwsohvtupyhe.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSwiaWF0IjoxNzQ4NzMzMTA5LCJleHAiOjIwNjQzMDkxMDl9.ndE8TOFcf0ZkXPh7SnXnwbAkvySV8dqr_UlT7KG7wXg'
  );
}
const supabase = window.supabaseClient;

const EMAIL_SERVICE_ID = 'default_service';
const EMAIL_TEMPLATE_ID = 'template_fkbtb1k';
const EMAIL_PUBLIC_KEY = '2ZatxIsbFksIaJdGL';
const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/symtechweb@gmail.com';

const VIDEO_LINKS = {
  zoom: 'https://us05web.zoom.us/j/5501853194?pwd=dFbNECaKMExysXuOXtAJyokS2TUsiz.1',
  meet: 'https://meet.google.com/rss-bfwd-coa',
  teams: 'https://teams.live.com/meet/936608741279?p=Fzq07RTYi6NSYRntZx'
};

function formatDateTime(dateStr, timeStr) {
  const [hour, minute] = timeStr.split(":").map(Number);
  const date = new Date(dateStr);
  date.setHours(hour, minute);
  return date;
}

function isValidBookingTime(date, time) {
  const bookingDate = formatDateTime(date, time);
  const now = new Date();
  const hour = bookingDate.getHours();
  return bookingDate > now && hour >= 7 && hour <= 22;
}

function getPrefilledMessage(user, method) {
  return `Hi SymTech Web, my name is ${user.name}. I just submitted a request for ${user.service} (Submission ID: ${user.submissionId}). I'd like to follow up via ${method}.`;
}

function updateTimeOptions() {
  const dateInput = document.getElementById('booking-date');
  const timeSelect = document.getElementById('booking-time');
  if (!dateInput || !timeSelect) return;

  const now = new Date();
  const selectedDate = new Date(dateInput.value);
  timeSelect.innerHTML = '';

  if (isNaN(selectedDate.getTime())) {
    timeSelect.innerHTML = '<option disabled selected>Select a valid date first</option>';
    return;
  }

  const isToday = selectedDate.toDateString() === now.toDateString();
  let startHour = isToday ? now.getHours() + 1 : 7;
  if (startHour < 7) startHour = 7;
  if (startHour > 22) {
    timeSelect.innerHTML = '<option disabled selected>No available times today</option>';
    return;
  }

  for (let hour = startHour; hour <= 22; hour++) {
    const start = hour.toString().padStart(2, '0') + ':00';
    const end = (hour + 1).toString().padStart(2, '0') + ':00';
    timeSelect.innerHTML += `<option value="${start}">${start} - ${end}</option>`;
  }

  timeSelect.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('smart-booking-popup');
  const openBtn = document.getElementById('book-meeting-btn');
  const closeBtn = document.getElementById('smart-booking-close');
  const confirmBtn = document.querySelector('#booking-schedule-form button[type="submit"]');

  const stepType = document.getElementById('booking-step-type');
  const stepOptions = document.getElementById('booking-step-options');
  const stepSchedule = document.getElementById('booking-step-schedule');
  const stepDone = document.getElementById('booking-step-done');

  const textOptions = document.getElementById('text-options');
  const callOptions = document.getElementById('call-options');
  const videoOptions = document.getElementById('video-options');
  const dateInput = document.getElementById('booking-date');
  const timeSelect = document.getElementById('booking-time');
  const closeConfirm = document.getElementById('close-confirmation-btn');

  let bookingType = "", selectedMethod = "";

  const user = {
    name: localStorage.getItem("stw_user_name") || "Anonymous",
    email: localStorage.getItem("stw_user_email") || "",
    phone: localStorage.getItem("stw_user_phone") || "",
    mediahandle: localStorage.getItem("stw_user_mediahandle") || '',
    user_type: localStorage.getItem("stw_user_type") || '',
    service: localStorage.getItem("stw_user_service") || "a service",
    submissionId: localStorage.getItem("stw_submission_id")
  };

  if (!user.submissionId) {
    alert("❌ Missing Submission ID. Please complete the Get Started form first.");
    return;
  }

  if (!user.name || user.name === "Anonymous" || user.name === "Guest") {
    const entered = prompt("Please enter your name to personalize your booking:");
    if (entered) {
      user.name = entered;
      localStorage.setItem("stw_user_name", entered);
    }
  }

  function showStep(step) {
    [stepType, stepOptions, stepSchedule, stepDone].forEach(el => el.style.display = 'none');
    step.style.display = 'block';
  }

  openBtn.onclick = () => {
    modal.style.display = 'flex';
    showStep(stepType);
    dateInput.valueAsDate = new Date();
    updateTimeOptions();
  };

  closeBtn.onclick = closeConfirm.onclick = () => {
    modal.style.display = 'none';
  };

  stepType.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      bookingType = btn.dataset.bookingType;
      showStep(stepOptions);
      textOptions.style.display = bookingType === 'text' ? 'flex' : 'none';
      callOptions.style.display = bookingType === 'voice' ? 'flex' : 'none';
      videoOptions.style.display = bookingType === 'video' ? 'flex' : 'none';
    };
  });

  stepOptions.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      selectedMethod = btn.dataset.textMethod || btn.dataset.callMethod || btn.dataset.videoMethod;

      if (bookingType === 'text') {
        const message = getPrefilledMessage(user, selectedMethod);
        const smsLink = `sms:+233256923760?body=${encodeURIComponent(message)}`;
        const waLink = `https://wa.me/233256923760?text=${encodeURIComponent(message)}`;
        const emailLink = `mailto:symtechweb@gmail.com?subject=Follow-up Booking&body=${encodeURIComponent(message)}`;
        const redirectLink = selectedMethod === 'email' ? emailLink : (selectedMethod === 'whatsapp' ? waLink : smsLink);
        window.open(redirectLink);
        modal.style.display = 'none';
        return;
      }

      showStep(stepSchedule);
      updateTimeOptions();
    };
  });

confirmBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  const date = dateInput.value;
  const time = timeSelect.value;

  if (!date || !time || !isValidBookingTime(date, time)) {
    alert("❌ Please select a valid future date and time (7AM–10PM).");
    return;
  }

  // Update button UI
  confirmBtn.disabled = true;
  const originalText = confirmBtn.textContent;
  confirmBtn.textContent = "Sending...";

  const message = getPrefilledMessage(user, selectedMethod);
  const join_link = selectedMethod === 'whatsapp' ? "https://wa.me/233256923760" : (VIDEO_LINKS[selectedMethod] || "");

  const record = {
    submission_id: user.submissionId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    service: user.service,
    booking_type: bookingType,
    method: selectedMethod,
    scheduled_date: date,
    scheduled_time: time,
    message,
    link: join_link
  };

  try {
    await supabase.from("bookings").insert([record]);

    await emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, {
      to_name: user.name,
      to_email: user.email,
      type: bookingType,
      method: selectedMethod,
      date,
      time,
      service: user.service,
      message,
      join_link
    }, EMAIL_PUBLIC_KEY);

    await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        message: `
          New booking from ${user.name} (${user.email})<br><br>
          <strong>Service:</strong> ${user.service}<br>
          <strong>Type:</strong> ${bookingType} (${selectedMethod})<br>
          <strong>Date:</strong> ${date}<br>
          <strong>Time:</strong> ${time}<br>
          <strong>Join Link:</strong> ${join_link}<br>
          <br>
          ${message}`
      })
    });

    showStep(stepDone);
  } catch (err) {
    alert("❌ Failed to complete booking. Please try again.");
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = originalText;
  }
});


  dateInput.addEventListener('change', updateTimeOptions);
});
