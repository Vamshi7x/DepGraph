import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <div className="navbar-brand-icon">D</div>
        DepGraph
      </NavLink>

      <div className="navbar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
        >
          🏠 Home
        </NavLink>
        <NavLink
          to="/blast-radius"
          className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
        >
          💥 Blast Radius
        </NavLink>
        <NavLink
          to="/compare"
          className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
        >
          🔀 Compare
        </NavLink>
      </div>

      <div className="navbar-right">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
        >
          ⭐ GitHub
        </a>
      </div>
    </nav>
  );
}
