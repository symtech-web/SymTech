// Function to show detailed information in a pop-up modal
function showPaymentDetails(paymentOption) {
    // Set the content of the modal based on the selected payment option
    let modalContent = '';
    
    switch(paymentOption) {
      case 'Mobile Money':
        modalContent = '<h3>Mobile Money</h3><p>This payment method allows you to pay using your mobile number. Please enter your details.</p>';
        break;
      case 'Bank Payments':
        modalContent = '<h3>Bank Payments</h3><p>You can pay via bank transfer. Kindly provide your bank account details.</p>';
        break;
      case 'Other Platforms':
        modalContent = '<h3>Other Payment Platforms</h3><p>This option allows you to use third-party payment platforms. Please select one from the available list.</p>';
        break;
      default:
        modalContent = '<h3>Error</h3><p>Payment option not recognized. Please try again.</p>';
    }
  
    // Set modal content
    document.getElementById('modal-content').innerHTML = modalContent;
  
    // Show the modal
    document.getElementById('payment-modal').style.display = 'block';
  }
  
  // Function to close the modal
  function closeModal() {
    document.getElementById('payment-modal').style.display = 'none';
  }
  
  // Event listeners for the payment plan buttons
  document.getElementById('plan1').addEventListener('click', function() {
    showPaymentDetails('Mobile Money');
  });
  document.getElementById('plan2').addEventListener('click', function() {
    showPaymentDetails('Bank Payments');
  });
  document.getElementById('plan3').addEventListener('click', function() {
    showPaymentDetails('Other Platforms');
  });
  