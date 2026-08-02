import type { ReactNode } from "react";

interface DefinitionCardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly icon: ReactNode;
  readonly title: string;
}

function DefinitionCard({
  children,
  className,
  icon,
  title,
}: DefinitionCardProps) {
  return (
    <section className={className}>
      <span className="basics-definition-icon">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </section>
  );
}

export default DefinitionCard;
