
  async function verifyStaff() {
    const staffId = document.getElementById('verifyId').value;

    if (!staffId.trim()) {
      document.getElementById('staffInfo').innerHTML = `<p style="color:red;">Please enter a valid Staff ID.</p>`;
      return;
    }

    const response = await fetch('/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId })
    });

    const data = await response.json();
    const staffInfoDiv = document.getElementById('staffInfo');

    if (data.verified) {
      const staff = data.staff;
      staffInfoDiv.innerHTML = `
        <h3>✅ Verification Successful</h3>
        <p><strong>Name:</strong> ${staff.name}</p>
        <p><strong>Department:</strong> ${staff.department}</p>
        <img src="/uploads/${staff.profile_pic}" width="150" alt="Profile Picture"
             style="border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);" />
      `;
    } else {
      staffInfoDiv.innerHTML = `<p style="color:red;">❌ ${data.message}</p>`;
    }
  }

