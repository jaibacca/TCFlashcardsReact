import { useEffect, useState } from 'react';
import './MigrationToast.css';

const MigrationToast = () => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Listen for migration events
    const handleMigration = (event) => {
      setMessage(event.detail.message);
      setShow(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShow(false);
      }, 5000);
    };

    window.addEventListener('migrationComplete', handleMigration);
    return () => window.removeEventListener('migrationComplete', handleMigration);
  }, []);

  if (!show) return null;

  return (
    <div className="migration-toast">
      <div className="migration-toast-content">
        <span className="migration-icon">🎉</span>
        <span className="migration-message">{message}</span>
        <button 
          className="migration-close" 
          onClick={() => setShow(false)}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default MigrationToast;
