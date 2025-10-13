// This can be a Server Component - just displays props
interface HeaderProps {
  title: string
  subtitle: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="header">
      <div className="title-wrapper">
        <h1 className="title">{title}</h1>
        <div className="title-underline"></div>
      </div>
      <p className="subtitle">
        {subtitle}
      </p>
    </header>
  )
}