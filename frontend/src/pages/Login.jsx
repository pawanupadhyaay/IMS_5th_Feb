import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import './Auth.css'

const Login = () => {
  const [email, setEmail] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('rememberedEmail') || ''
  })
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('rememberedEmail')
  })
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password, rememberMe)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo-wrapper">
          <img
            src="https://i.ibb.co/2XHCWRL/samay-logo.png"
            alt="Samay IMS logo"
            className="auth-logo"
          />
        </div>
        <h1>Samay Watch IMS</h1>
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="remember-me-row">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span>Remember me</span>
            </label>
          </div>
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  )
}

export default Login

