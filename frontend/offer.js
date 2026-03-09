// Get code element
const code = document.getElementById("code");

// Generate a random 6-character alphanumeric code
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Set dynamic code
const c = generateCode();
code.innerText = c;

// Confetti animation
function createConfetti() {
  for(let i=0;i<30;i++){
    const c = document.createElement('div');
    c.classList.add('confetti');
    c.style.left = Math.random() * window.innerWidth + 'px';
    c.style.background = `hsl(${Math.random()*360},70%,60%)`;
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),3000);
  }
}

// Share button
function share() {
  if (navigator.share) {
    navigator.share({
      title: "Exclusive Ride Offer",
      text: `Use code ${c} & get 20% OFF your next ride!🛺🛺`
    }).catch(err => console.log("Sharing failed:", err));
  } else {
    alert(`🎉 Your offer code: ${c}`);
  }
  createConfetti();
}
