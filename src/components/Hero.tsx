interface HeroProps {
  title: string
}

export default function Hero(props: HeroProps) {
  return (
    <div className="pt-48 flex justify-center">
      <h1 className="text-6xl">{props.title}</h1>
    </div>
  )
}
