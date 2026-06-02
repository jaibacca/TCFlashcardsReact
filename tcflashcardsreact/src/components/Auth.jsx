import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Auth = () => {
  const { user, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email');
      return;
    }

    setLoading(true);
    setMessage('');

    const { success, error } = await signInWithEmail(email);

    setLoading(false);

    if (success) {
      setMessage('✅ Check your email for the magic link!');
      setEmail('');
      setShowForm(false);
    } else {
      setMessage(`❌ ${error}`);
    }
  };

  const handleSignOut = async () => {
    const { success } = await signOut();
    if (success) {
      setMessage('Signed out successfully');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (user) {
    return (
      <div className="auth-container signed-in">
        <div className="user-info">
          <span className="user-icon">👤</span>
          <span className="user-email">{user.email}</span>
        </div>
        <button onClick={handleSignOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="auth-container">
        <button onClick={() => setShowForm(true)} className="sign-in-btn">
          🔐 Sign In to Sync Progress
        </button>
        <p className="auth-hint">Progress will be saved across devices</p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h3>Sign In with Email</h3>
        <p className="auth-description">
          We'll send you a magic link - no password needed!
        </p>
        
        <form onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="email-input"
            required
          />
          
          <div className="auth-buttons">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? '⏳ Sending...' : '📧 Send Magic Link'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowForm(false)} 
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        {message && (
          <div className={`auth-message ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <p className="auth-footer">
          Your progress will automatically sync across all your devices when signed in.
        </p>
      </div>
    </div>
  );
};

export default Auth;
