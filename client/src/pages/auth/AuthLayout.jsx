import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Brand } from './Landing';

export default function AuthLayout({ children }) {
  return (
    <div className="rg-auth">
      <div className="rg-auth-visual">
        <Brand />
        <div><strong>Ride across<br />Ahmedabad.</strong><Link to="/story-demo" className="rg-link rg-secondary"><BookOpen size={17} /> DBMS walkthrough</Link></div>
      </div>
      <main className="rg-auth-content rg-enter">
        <Link className="rg-back" to="/"><ArrowLeft size={16} /> Home</Link>
        {children}
      </main>
    </div>
  );
}

