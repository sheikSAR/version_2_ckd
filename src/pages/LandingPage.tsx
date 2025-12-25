import React from 'react'
import { useNavigate } from 'react-router-dom'
import ConfiguratorNavbar from '../components/ConfiguratorNavbar'
import '../styles/LandingPage.css'

const LandingPage = () => {
  const navigate = useNavigate()

  const cards = [
    {
      id: 1,
      title: 'Data Graph',
      subtitle: 'ER Diagram',
      description: 'Visualize and manage your entity relationship diagrams',
      icon: '📊',
      route: '/configurator/data-graph',
      badge: 'Available',
    },
    {
      id: 2,
      title: 'DL Graph',
      subtitle: 'Deep Learning',
      description: 'Configure deep learning model architecture',
      icon: '🧠',
      route: '/configurator/dl-graph',
      badge: 'Coming Soon',
      disabled: true,
    },
    {
      id: 3,
      title: 'Filtering',
      subtitle: 'Data Filtering',
      description: 'Set up advanced data filtering rules',
      icon: '🔍',
      route: '/configurator/filtering',
      badge: 'Coming Soon',
      disabled: true,
    },
    {
      id: 4,
      title: 'Meta Graph',
      subtitle: 'Metadata',
      description: 'Manage metadata and graph properties',
      icon: '🏷️',
      route: '/configurator/meta-graph',
      badge: 'Coming Soon',
      disabled: true,
    },
  ]

  const handleCardClick = (route: string, disabled: boolean) => {
    if (!disabled) {
      navigate(route)
    }
  }

  return (
    <div className="landing-page">
      <ConfiguratorNavbar />
      <div className="landing-container">
        <div className="landing-content">
          <div className="landing-header">
            <h1 className="landing-title">Configuration Workspace</h1>
            <p className="landing-subtitle">Select a module to explore and configure your data ecosystem</p>
          </div>

          <div className="cards-grid">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`card ${card.disabled ? 'disabled' : 'active'}`}
                onClick={() => handleCardClick(card.route, card.disabled)}
              >
                <div className="card-badge">{card.badge}</div>
                <div className="card-icon">{card.icon}</div>
                <div className="card-content">
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-subtitle">{card.subtitle}</p>
                  <p className="card-description">{card.description}</p>
                </div>
                {!card.disabled && (
                  <div className="card-footer">
                    <span className="card-action">Explore →</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
