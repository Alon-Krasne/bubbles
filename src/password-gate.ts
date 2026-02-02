/**
 * Password Gate Module
 * Provides client-side password protection for the game.
 * Uses SHA-256 hashing for password comparison.
 */

// Injected at build time from environment variable
declare const __PASSWORD_HASH__: string;

const SESSION_KEY = 'bubbles_authenticated';

/**
 * Hash a string using SHA-256
 */
async function sha256(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if user is already authenticated this session
 */
function isAuthenticated(): boolean {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
}

/**
 * Mark user as authenticated for this session
 */
function setAuthenticated(): void {
    sessionStorage.setItem(SESSION_KEY, 'true');
}

/**
 * Verify the entered password against the stored hash
 */
async function verifyPassword(password: string): Promise<boolean> {
    const inputHash = await sha256(password.trim().toLowerCase());
    return inputHash === __PASSWORD_HASH__;
}

/**
 * Create and show the password overlay
 */
function createPasswordOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'password-overlay';
    overlay.innerHTML = `
    <div class="password-modal">
      <div class="password-decorations">
        <div class="floating-bubble" style="--delay: 0s; --x: 15%; --size: 50px;"></div>
        <div class="floating-bubble" style="--delay: 1.5s; --x: 85%; --size: 40px;"></div>
        <div class="floating-star" style="--delay: 0.5s; --x: 20%; --y: 15%;"></div>
        <div class="floating-star" style="--delay: 2s; --x: 75%; --y: 25%;"></div>
      </div>
      <h2 class="password-title">🔐 הכניסו סיסמה 🔐</h2>
      <form id="password-form">
        <input 
          type="password" 
          id="password-input" 
          class="password-input" 
          placeholder="סיסמה..."
          autocomplete="off"
          autofocus
        />
        <button type="submit" class="password-submit">
          <span class="play-icon">▶</span>
          <span>כניסה</span>
        </button>
        <p id="password-error" class="password-error hidden">סיסמה שגויה, נסו שוב 💫</p>
      </form>
    </div>
  `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
    #password-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      direction: rtl;
    }
    
    .password-modal {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 30px;
      padding: 40px 50px;
      box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      text-align: center;
      position: relative;
      overflow: hidden;
      max-width: 90%;
      width: 380px;
      animation: modalBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes modalBounce {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .password-decorations {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }
    
    .password-title {
      font-size: 1.8rem;
      color: #764ba2;
      margin-bottom: 25px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      animation: titlePulse 2s ease-in-out infinite;
    }
    
    @keyframes titlePulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    
    .password-input {
      width: 100%;
      padding: 16px 20px;
      font-size: 1.3rem;
      border: 3px solid #e0e0e0;
      border-radius: 20px;
      text-align: center;
      outline: none;
      transition: all 0.3s ease;
      background: #fafafa;
      margin-bottom: 20px;
      direction: ltr;
    }
    
    .password-input:focus {
      border-color: #764ba2;
      box-shadow: 0 0 0 4px rgba(118, 75, 162, 0.2);
      background: white;
    }
    
    .password-submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 16px 30px;
      font-size: 1.4rem;
      font-weight: bold;
      color: white;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 20px rgba(118, 75, 162, 0.4);
    }
    
    .password-submit:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(118, 75, 162, 0.5);
    }
    
    .password-submit:active {
      transform: translateY(0);
    }
    
    .password-submit .play-icon {
      font-size: 1.2rem;
    }
    
    .password-error {
      color: #e74c3c;
      margin-top: 15px;
      font-size: 1.1rem;
      animation: shake 0.5s ease-in-out;
    }
    
    .password-error.hidden {
      display: none;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }
    
    /* Reuse floating decorations from main game */
    #password-overlay .floating-bubble {
      position: absolute;
      width: var(--size);
      height: var(--size);
      left: var(--x);
      bottom: -100px;
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(118,75,162,0.3));
      border-radius: 50%;
      animation: floatUp 8s ease-in-out infinite;
      animation-delay: var(--delay);
      opacity: 0.6;
    }
    
    @keyframes floatUp {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0; }
      10% { opacity: 0.6; }
      90% { opacity: 0.6; }
      100% { transform: translateY(-500px) scale(0.8); opacity: 0; }
    }
    
    #password-overlay .floating-star {
      position: absolute;
      left: var(--x);
      top: var(--y);
      font-size: 24px;
      animation: sparkle 3s ease-in-out infinite;
      animation-delay: var(--delay);
    }
    
    #password-overlay .floating-star::before {
      content: '✨';
    }
    
    @keyframes sparkle {
      0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
      50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
    }
  `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    return overlay;
}

/**
 * Initialize password protection
 * Returns a promise that resolves when user is authenticated
 */
export function initPasswordGate(): Promise<void> {
    return new Promise((resolve) => {
        // Skip if already authenticated
        if (isAuthenticated()) {
            resolve();
            return;
        }

        // Skip if no password hash is set (development mode)
        if (typeof __PASSWORD_HASH__ === 'undefined' || __PASSWORD_HASH__ === '') {
            resolve();
            return;
        }

        const overlay = createPasswordOverlay();
        const form = document.getElementById('password-form') as HTMLFormElement;
        const input = document.getElementById('password-input') as HTMLInputElement;
        const errorEl = document.getElementById('password-error') as HTMLElement;

        // Focus input after animation
        setTimeout(() => input.focus(), 600);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = input.value;
            if (!password) return;

            const isValid = await verifyPassword(password);

            if (isValid) {
                setAuthenticated();
                overlay.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                overlay.style.opacity = '0';
                overlay.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 400);
            } else {
                errorEl.classList.remove('hidden');
                input.value = '';
                input.focus();
                // Reset animation
                errorEl.style.animation = 'none';
                void errorEl.offsetWidth;
                errorEl.style.animation = '';
            }
        });
    });
}
