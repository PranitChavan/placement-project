import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './logout.css';

export default function Logout() {
  const { logoutHandler } = useAuth();

  return (
    <form className="logout-form">
      <button type="button" className="google-btn logout-form__btn" onClick={logoutHandler}>
        Logout
      </button>
    </form>
  );
}
