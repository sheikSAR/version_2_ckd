import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/LandingPage.css'

const LandingPage = () => {
  const navigate = useNavigate()

  const cards = [
    { id: 1, title: 'Data Graph (ER Diagram)', route: '/configurator/data-graph' },
    { id: 2, title: 'DL Graph', route: '/configurator/dl-graph' },
    { id: 3, title: 'Filtering', route: '/configurator/filtering' },
    { id: 4, title: 'Meta Graph', route: '/configurator/meta-graph' },
  ]

  const handleCardClick = (route: string) => {
    navigate(route)
  }

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Configuration Workspace</h1>
        <p className="landing-subtitle">Select a module to explore the configuration graph</p>

        <div className="cards-grid">
          {cards.map((card) => (
            <div
              key={card.id}
              className="card"
              onClick={() => handleCardClick(card.route)}
            >
              <p className="card-title">{card.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LandingPage
