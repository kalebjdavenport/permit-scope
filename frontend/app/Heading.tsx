export function Heading({ children, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className="text-2xl font-bold my-3" {...props}>
      {children}
    </h1>
  )
}

export function Subheading({ children, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className="font-medium" {...props}>
      {children}
    </h2>
  )
}
