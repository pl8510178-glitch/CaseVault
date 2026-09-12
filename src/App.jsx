import "./App.css";

function App() {
  return (
    <div className="splash-screen">

      <div className="logo-container">
        <img
          src="/logo.png"
          alt="Secure Evidence Logo"
          className="security-logo"
        />

        <h1>SECURE EVIDENCE</h1>

        <p>Digital Document Management System</p>

        <div className="loading-line">
          <div className="loading-progress"></div>
        </div>

        <span className="system-status">
          Initializing secure system...
        </span>
      </div>

    </div>
  );
}

export default App;