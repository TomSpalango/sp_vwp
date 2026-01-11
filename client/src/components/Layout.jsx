import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

export default function Layout() {
  return (
    <>
      <NavBar />
      <main className="container my-4">
        <Outlet />
      </main>
    </>
  );
}
