import { useEffect } from 'react';
import Navbar from './Navbar';
import Slides from './Slides';
import { useAuth } from '../contexts/AuthContext';

function Landing() {
  const { currentUser, accountType } = useAuth();

  return (
    <>
      <Navbar loggedInOrNot={currentUser} />
      <Slides />
    </>
  );
}

export default Landing;
