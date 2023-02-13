import React from 'react'
import externalLinkIcon from '../../../../assets/ExternalLink.svg'
import './AppCard.scss'

interface AppCardProps {
  name: string
  description: string
  logo: string
  bgColor: string
  url: string
}

const AppCard: React.FC<AppCardProps> = ({ name, description, logo, bgColor, url }) => {
  return (
    <a
      className="AppCard"
      style={{ backgroundColor: bgColor }}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="AppCard__header">
        <img className="AppCard__header__logo" src={logo} alt={`${name} logo`} />
        <img className="AppCard__header__link" src={externalLinkIcon} alt={`navigate to ${url}`} />
      </div>

      <div className="AppCard__body">
        <h2 className="AppCard__body__name">{name}</h2>
        <div className="AppCard__body__description">{description}</div>
        <div className="AppCard__body__url">{url}</div>
      </div>
    </a>
  )
}

export default AppCard
