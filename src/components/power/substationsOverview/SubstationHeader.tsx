
interface SubstationHeaderProps {
  title: string;
  description: string;
}

export function SubstationHeader({ title, description }: SubstationHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
